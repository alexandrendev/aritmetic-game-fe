export interface Avatar {
  id: number | string;
  name?: string;
  path?: string;
  url?: string;
  thumbnailUrl?: string;
}

export interface AdminFile {
  id: number;
  path: string;
  url: string;
  createdAt: string;
  updatedAt: string | null;
}
