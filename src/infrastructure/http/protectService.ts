import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { FileSystemPort } from '../filesystem/fileSystemPort';
import { Logger } from '../../cli/output/logger';

export interface ProtectServicePort {
  protectPack(fileDirectory: string, host: string, gameDir: string, packId: string): Promise<string | null>;
}

export class HttpProtectService implements ProtectServicePort {
  constructor(private readonly fs: FileSystemPort, private readonly logger: Logger) {}

  async protectPack(fileDirectory: string, host: string, gameDir: string, packId: string): Promise<string | null> {
    const fileBuffer = this.fs.createReadStream(fileDirectory);
    const fileName = path.basename(fileDirectory);

    const formData = new FormData();
    formData.append('pack_file', fileBuffer, fileName);
    formData.append('game_dir', gameDir);
    formData.append('rep_id', packId);

    try {
      const response = await axios.post(`https://${host}/mprotector/packs/zip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.dl_link) {
        this.logger.success(`Pack created: ${response.data.dl_link}`);
        return response.data.dl_link as string;
      }
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`${error.response.data}`);
      } else {
        this.logger.error(String(error));
      }
      return null;
    }
  }
}
