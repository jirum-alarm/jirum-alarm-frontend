import { gql } from '@apollo/client';

export const QueryMyAdminAccess = gql`
  query MyAdminAccess {
    myAdminAccess {
      isAdmin
      roleName
      sections
    }
  }
`;

export const QueryAdminPermissions = gql`
  query AdminPermissions {
    adminSections
    adminRoles {
      id
      name
      sections
      isSystem
    }
    adminUsersWithRole {
      id
      email
      name
      roleId
    }
  }
`;

export const MutationCreateAdminRole = gql`
  mutation CreateAdminRole($name: String!, $sections: [String!]!) {
    createAdminRole(name: $name, sections: $sections) {
      id
    }
  }
`;

export const MutationUpdateAdminRole = gql`
  mutation UpdateAdminRole($id: Int!, $name: String!, $sections: [String!]!) {
    updateAdminRole(id: $id, name: $name, sections: $sections) {
      id
    }
  }
`;

export const MutationDeleteAdminRole = gql`
  mutation DeleteAdminRole($id: Int!) {
    deleteAdminRole(id: $id)
  }
`;

export const MutationAssignAdminRole = gql`
  mutation AssignAdminRole($adminUserId: Int!, $roleId: Int) {
    assignAdminRole(adminUserId: $adminUserId, roleId: $roleId)
  }
`;
