export interface FileItem {
  id: number
  name: string
  displayName?: string
  type?: string
  size?: number              
  modified?: string          
  uploadedAt?: string        
  owner?: string
  s3Key?: string
  path?: string
  isFolder: boolean
}
