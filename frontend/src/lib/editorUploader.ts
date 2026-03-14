import axios from "axios";
import { api } from "./api";

interface EditorJsImageResponse {
  success: number;
  file: {
    url: string;
  };
}

export async function uploadImageByFile(
  file: File,
): Promise<EditorJsImageResponse> {
  try {
    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      throw new Error("The image exceeds the 5MB limit.");
    }

    const response = await api.post("/media/upload-url", {
      filename: file.name,
      contentType: file.type,
      contentLength: file.size,
    });

    const { uploadUrl, publicUrl } = response.data;

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return {
      success: 1,
      file: {
        url: publicUrl,
      },
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Request error: ", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("Error: ", err.message);
    }

    return {
      success: 0,
      file: {
        url: "",
      },
    };
  }
}

export async function uploadImageByUrl(
  url: string,
): Promise<EditorJsImageResponse> {
  return new Promise((resolve) => {
    resolve({
      success: 1,
      file: { url },
    });
  });
}
