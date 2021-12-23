import { message } from 'antd';
import { axios } from './axios';

export const me = async () => {
  try {
    const response = await axios.get('/me');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message);
    }
  }
};
