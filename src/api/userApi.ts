import axiosInstance from './axiosInstance'

export async function updatePreferences(hashIdentity: boolean): Promise<void> {
  await axiosInstance.patch('/users/me/preferences', { hashIdentity })
}
