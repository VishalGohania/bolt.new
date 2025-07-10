export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
}

export interface Step {
  id: string | number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  type?: StepType;
  code?: string;
  explanation?: string;
  path?: string;
}