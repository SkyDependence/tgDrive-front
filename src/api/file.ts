import request from '../utils/request';

/**
 * Deletes files based on their IDs.
 * @param fileIds An array of file IDs to delete.
 * @returns A promise with the API response.
 */
export function deleteFiles(fileIds: string[]) {
  return request({
    url: '/files',
    method: 'delete',
    data: fileIds,
  });
}
