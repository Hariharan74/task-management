export interface User {
    id: string;
    email: string;
    token: string;
  }

  export type RootStackParamList = {
    Home: undefined;
    TaskDetail: { taskId: string };
    Login: undefined;
    Signup: undefined;
  };
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    createdAt: string;
    completed?: boolean;
  }