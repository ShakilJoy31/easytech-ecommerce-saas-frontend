import { appConfiguration } from "@/utils/constant/appConfiguration";
import axios from "axios";

export interface UploadResponse {
  success: boolean;
  data: {
    filename: string;
    path: string;
  };
}

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await axios.post(
      `${appConfiguration.baseUrl}/document/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
    throw new Error("Upload failed");
  }
};