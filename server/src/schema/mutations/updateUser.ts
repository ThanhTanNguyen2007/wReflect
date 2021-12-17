import { RequestWithUserInfo } from '../../types';
import { GraphQLString, GraphQLList } from 'graphql';

import { UserType } from '../types';
import { user } from '../../services';

type arguments = {
  picture?: string;
};

export default {
  type: UserType,
  args: {
    picture: { type: GraphQLString },
  },
  resolve: async (_, args: arguments, request: RequestWithUserInfo) => {
    const { id } = request.user;
    return await user.updateUser(id, args);
  },
};
