import { GraphQLObjectType } from 'graphql';
// import { deleteTeam, createTeam } from './mutations';
import createTeam from './mutations/createTeam';
import updateTeam from './mutations/updateTeam';
import deleteTeam from './mutations/deleteTeam';

import addMember from './mutations/addMember';
import removeMember from './mutations/removeMember';
import setRoleMember from './mutations/setRoleMember';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    setRoleMember
  },
});

export default Mutation;
