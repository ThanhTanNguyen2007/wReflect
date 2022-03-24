import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type statusRequest {
    success: Boolean
  }

  type Subscription {
    subOnUpdateTeams(meId: ID!): statusRequest
    subOnUpdateTeam(meId: ID!, teamId: ID!): Team

    updateBoard(meId: ID!, teamId: ID!): Board

    subOnUpdateColumn(meId: ID!, teamId: ID!): Column

    updateOpinion(meId: ID!, teamId: ID!): Opinion

    updateGetHealthCheckData(meId: ID!, teamId: ID!): getHealthCheck
  }
`;

export default typeDefs;
