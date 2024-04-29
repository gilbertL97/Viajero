import { CustomConfigService } from './../../config/service/config.service';
import { Injectable } from '@nestjs/common';
import { FileHelper } from 'src/common/file/file.helper';
import { Configuration } from 'src/config/config.const';
import { ContractorService } from 'src/contractor/service/contractor.service';
import { TravelerUploadFilesService } from 'src/traveler/service/traveler.upload-files.service';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entity/user.entity';
import { ResponseErrorOrWarningDto } from 'src/traveler/dto/responseErrorOrWarning.dto';
import { ExportToTxt } from './exportToTxt';
import { ExternalFilesHelper } from 'src/common/file/externalServiceFiles.helper';
import { CoverageService } from 'src/coverage/coverage.service';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class AutoImportFileService {
  constructor(
    private readonly exportToTxt: ExportToTxt,
    private readonly contractorService: ContractorService,
    private readonly coverageService: CoverageService,
    private readonly countryService: CountryService,
    private readonly travelerService: TravelerUploadFilesService,
    private readonly userService: UserService,
    private readonly configService: CustomConfigService,
  ) {}

  //@Cron('* 1 * * * *')
  async autoImportFiles() {
    console.log('Called when the current second is 45');
    const userSystem = await this.userService.findUserByName('system'); //usuario del sistema}
    const pathUnprocess = await this.configService.findConfigByKEy(
      Configuration.FILES_PATH,
    );
    const pathToLogs = await this.configService.findConfigByKEy(
      Configuration.FILES_LOGS_PATH,
    );
    const procecedFiles = await this.configService.findConfigByKEy(
      Configuration.FIlES_PROCESSED_PATH,
    );
    await this.importFiles(
      userSystem,
      pathUnprocess.value,
      pathToLogs.value,
      procecedFiles.value,
    );
  }
  async manuallyImportFiles(user: UserEntity) {
    const pathUnprocess = await this.configService.findConfigByKEy(
      Configuration.FILES_PATH,
    );
    const pathToLogs = await this.configService.findConfigByKEy(
      Configuration.FILES_LOGS_PATH,
    );
    //guardo en una carpeta temporal para descargar un zip con todos los logs de las carpetas importadas en ese momento
    const tempFile = await this.configService.findConfigByKEy(
      Configuration.TEMP_FILE,
    );
    const procecedFiles = await this.configService.findConfigByKEy(
      Configuration.FIlES_PROCESSED_PATH,
    );
    await this.importFiles(
      user,
      pathUnprocess.value,
      pathToLogs.value,
      procecedFiles.value,
      tempFile.value,
    );
    return this.compressFile(tempFile.value);
  }

  private async importFiles(
    user: UserEntity,
    pathUnprocess: string,
    pathToLogs: string,
    procecedFiles: string,
    pathTemp?: string,
  ) {
    const contractors = await this.contractorService.getContratorsActive();
    // cargo todos los paises clientes y planes en memoria
    const [countries, coverages, userEntity] = await Promise.all([
      this.countryService.findAll(),
      this.coverageService.getCoveragesActives(),
      this.userService.getUser(user.id),
    ]);
    for (const contractor of contractors) {
      //direcciones de cada carpeta de los contratantes
      const unproceced = FileHelper.joinPath(pathUnprocess, contractor.file);
      const pathLogs = FileHelper.joinPath(pathToLogs, contractor.file);
      const procecedFile = FileHelper.joinPath(procecedFiles, contractor.file);
      //obtengo todos los archivos de ese contratante}
      const files = FileHelper.getAllFilesInFolder(unproceced);

      for (const file of files) {
        //uno las direcciones de cada archivo con las direcciones de cada contratante
        const pathFile = FileHelper.joinPath(unproceced, file);
        const pathtoProceced = FileHelper.joinPath(procecedFile, file);
        // cargo todos los paises clientes y planes en memoria

        //llamo al metodo para cargar viajeros en los archivos
        const log = await this.travelerService.processBulkFile(
          pathFile,
          contractor,
          countries,
          coverages,
          userEntity,
        );
        await this.writeLogs(
          pathLogs,
          file,
          log,
          FileHelper.joinPath(pathTemp, contractor.file),
        );
        FileHelper.moveFileAndCreateRoute(
          procecedFile,
          pathtoProceced,
          pathFile,
        );
      }
    }
  }
  private async compressFile(path: string): Promise<Buffer> {
    const buffer = await ExternalFilesHelper.compressFolder(path);
    this.exportToTxt.deleteAllfolderIntemp(path);
    //FileHelper.deleteDir(path);
    // if(buffer)FileHelper.m
    return buffer;
  }
  private writeLogs(
    path: string,
    filename: string,
    logs: ResponseErrorOrWarningDto | void,
    temp?: string,
  ) {
    this.exportToTxt.insertTableInTxt(logs, path, filename);
    if (temp) this.exportToTxt.insertTableInTxt(logs, temp, filename);
  }
}
