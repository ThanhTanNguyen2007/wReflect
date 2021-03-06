import { StatusCodes } from 'http-status-codes';
import config from '../config';
import prisma from './../prisma';
import { createTeamType, RequestWithUserInfo, updateTeamType } from '../types';
import { Team, TeamStatus, BanningUser } from '@prisma/client';
import { errorName } from '../constant/errorsConstant';
import { ForbiddenError, ApolloError } from 'apollo-server-errors';
import { checkIsMemberOfTeam, checkIsMemberOwningTeam, allowUpdatingOpinion, checkIsAdmin } from './essential';
import error from '../errorsManagement';
import { updateActionTrackerType } from '../apollo/TypeDefs/opinionTypeDefs';

export const getTeams = async (
  isAdmin: boolean,
  isGettingAll = false,
  page = 1,
  size = 8,
  search = '',
  status?: TeamStatus,
) => {
  await checkIsAdmin(isAdmin);

  const data = await prisma.team.findMany({
    where: {
      AND: [
        {
          name: {
            contains: search.trim().toLowerCase(),
            mode: 'insensitive',
          },
        },
        {
          status: status?.trim() == 'ALL' ? undefined : status,
        },
      ],
    },
    ...(!isGettingAll && { skip: (page - 1) * size }),
    ...(!isGettingAll && { take: size }),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      boards: true,
      members: true,
    },
  });

  const total = await prisma.team.count({
    where: {
      AND: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          status: status?.trim() == 'ALL' ? undefined : status,
        },
      ],
    },
  });

  return {
    data,
    total,
    page,
    size,
  };
};

export const getTeamsOfUser = async (meId: string, isGettingAll = false, page = 1, size = 8, search = '') => {
  const myTeams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: meId,
        },
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    ...(!isGettingAll && { skip: (page - 1) * size }),
    ...(!isGettingAll && { take: size }),
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.team.count({
    where: {
      members: {
        some: {
          userId: meId,
        },
      },
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
  });

  return {
    data: myTeams,
    total,
    page,
    size,
  };
};

export const getTeam = async (teamId: string, userId?: string) => {
  const where = userId
    ? {
        OR: [
          {
            isPublic: true,
          },
          {
            boards: {
              some: {
                isPublic: true,
              },
            },
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      }
    : undefined;

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ...where,
    },
  });
  if (!team) return error.NotFound();

  return team;
};

export const createTeam = async (req: RequestWithUserInfo, data: createTeamType) => {
  const { id: meId } = req.user;

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : new Date();

  const team = await prisma.team.create({
    data: {
      picture: `${config.SERVER_URL}/uploads/teamDefault.png`,
      ...data,
      startDate,
      endDate,
      boards: {
        create: {
          createdBy: meId,
          title: 'Default Board',
          columns: {
            createMany: {
              data: [
                {
                  title: 'Went Well',
                  isActive: true,
                  position: 1,
                },
                {
                  title: 'To Improve',
                  isActive: true,
                  position: 2,
                },
                {
                  title: 'Action Items',
                  isActive: true,
                  position: 3,
                },
                {
                  title: '',
                  isActive: false,
                  position: 4,
                },
                {
                  title: '',
                  isActive: false,
                  position: 5,
                },
              ],
            },
          },
        },
      },
      members: {
        create: {
          isSuperOwner: true,
          userId: meId,
        },
      },
    },
    include: {
      boards: true,
    },
  });

  return team;
};

export const updateTeam = async (req: RequestWithUserInfo, data: updateTeamType): Promise<Team> => {
  const { id: meId } = req?.user;
  const startDate = data.startDate ? new Date(data.startDate) : undefined;
  const endDate = data.endDate ? new Date(data.endDate) : undefined;

  const team = await prisma.team.updateMany({
    where: {
      id: data.id,
      members: {
        some: {
          userId: meId,
          isOwner: true,
        },
      },
    },
    data: {
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      picture: data.picture,
      startDate,
      endDate,
    },
  });

  if (!team[0]) throw new Error(errorName.FORBIDDEN);

  return team[0];
};

export const changeTeamAccess = async (meId: string, teamId: string, isPublic: boolean) => {
  await checkIsMemberOwningTeam(teamId, meId);

  const team = await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      isPublic: isPublic,
    },
  });

  if (!team) return error.NotFound();
  return team;
};

export const deleteTeam = async (req: RequestWithUserInfo, teamId: string) => {
  const { id: meId } = req?.user;
  const batchPayload = await prisma.team.deleteMany({
    where: {
      id: teamId,
      members: {
        some: {
          userId: meId,
          isOwner: true,
        },
      },
    },
  });

  if (!batchPayload) throw new ForbiddenError(`You are not the owner of Team ${teamId}`);
  return batchPayload;
};

export const updateActionTracker = async (meId: string, args: updateActionTrackerType) => {
  const memberOfTeam = await checkIsMemberOfTeam(args?.teamId, meId);

  await allowUpdatingOpinion(memberOfTeam, args.opinionId);

  const team = await prisma.team.update({
    where: {
      id: args.teamId,
    },
    data: {
      boards: {
        update: [
          {
            where: {
              id: args.sourceBoardId,
            },
            data: {
              columns: {
                update: {
                  where: {
                    id: args.sourceColumnId,
                  },
                  data: {
                    opinions: {
                      disconnect: {
                        id: args.opinionId,
                      },
                    },
                  },
                },
              },
            },
          },
          {
            where: {
              id: args.destinationBoardId,
            },
            data: {
              columns: {
                update: {
                  where: {
                    id: args.destinationColumnId,
                  },
                  data: {
                    opinions: {
                      connect: {
                        id: args.opinionId,
                      },
                      update: {
                        where: {
                          id: args.opinionId,
                        },
                        data: {
                          responsible: args.responsible,
                          status: args.status,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
  });

  if (!team) return error?.NotFound();
  return team;
};

// export const createBoard = async (req: RequestWithUserInfo, teamId: string) => {
//   const {id: }
// }

// export const updateAction = async (teamId: string,userId: string, boardId: string, ) => {
//   const team = await prisma.team.update({
//     where: {
//       id: teamId
//     },
//     data: {
//       boards: {
//         update: {
//           where: {
//             id: boardId,
//           },
//           data: {
//             update: {
//               col
//             }
//           }
//         }
//       }
//     }
//   })
// }
