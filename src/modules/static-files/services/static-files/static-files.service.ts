import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import * as sharp from 'sharp';

@Injectable()
export class StaticFilesService {
  async convertAndSaveImage(base64?: string) {
    if (base64) {
      const fileName = `${uuid.v4()}.webp`;
      const data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(data, 'base64');

      const uploadPath = path.join(`${process.cwd()}/src`, 'uploads');

      const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();

      await writeFile(path.join(uploadPath, fileName), webpBuffer);
      return fileName;
    }
    return '';
  }
}
