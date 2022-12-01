import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { FileHelper } from 'src/common/file/file.helper';
import { ContractorService } from 'src/contractor/contractor.service';
import { CountryService } from 'src/country/country.service';
import { CoverageService } from 'src/coverage/coverage.service';
import { TravelerRepository } from '../traveler.repository';
import Excel = require('exceljs');
import { TravelerEntity } from '../entity/traveler.entity';
import { numberToString } from 'pdf-lib';
import { CalculateDaysTraveler } from '../helper/calculate-days.traveler';
import { CoverageEntity } from 'src/coverage/entities/coverage.entity';

@Injectable()
export class TravelerUploadFilesService {
  constructor(
    @InjectRepository(TravelerRepository)
    private readonly travelerRepository: TravelerRepository,
    private readonly contratctoService: ContractorService,
    private readonly countryService: CountryService,
    private readonly coverageService: CoverageService,
  ) {}
  async processFile(file: Express.Multer.File, idClient: number) {
    const TravelersErrors: TravelerEntity[] = [];
    const client = await this.contratctoService.getContractor(idClient);
    const countries = await this.countryService.findAll();
    const coverages = await this.coverageService.getCoverages();
    const workbook = new Excel.Workbook();
    const excel = await workbook.xlsx.readFile(file.path);
    const worksheet = excel.getWorksheet(1);
    worksheet.spliceRows(1, 1); //elimino la primera fila que es la de los encabezados
    let i = 0;
    const book=[];
    worksheet.eachRow((r) => {
      const rows = r.values;
      book.push(rows);
      //rows.shift;// elimino la primera celda q siempre sale en empty
      // (rows as any[]).forEach((value) => {
      //   console.log(value, i);
      // }); // tuve que castearlo a any xq hay un error issue en ts q dice q hayq castearlo sino da error
      /*console.log('Titular ' + rows[1]);
      console.log();
      console.log('Sexo ' + rows[2]);
      console.log('Fecha de Nacimiento ' + rows[3]);
      console.log('Correo Electrónico ' + rows[4]);
      console.log('PASAPORTE ' + rows[5]);
      console.log('PAIS ORIGEN ' + rows[6]);
      console.log('NACIONALIDAD ' + rows[7]);
      console.log('VUELO ' + rows[8]);
      console.log('TIPO COBERTURA ' + rows[9]);
      console.log('FECHA DE VENTA ' + rows[10]);
      console.log('FECHA DE INICIO ' + rows[11]);
      console.log('FECHA DE FIN DE POLIZA ' + rows[12]);
      console.log('DIAS ACTIVIDAD ALTO RIESGO ' + rows[13]);
      console.log('CANTIDAD DIAS' + rows[14]);
      console.log('IMPORTE DIAS ALTO RIESGO ' + rows[15]);
      console.log('IMPORTE DIAS CUBIERTOS ' + rows[16]);
      console.log('IMPORTE TOTAL ' + rows[17]);*/

      i++;
    });
    console.log(book);
    await FileHelper.deletFile(file.path);
  }
  validateEmpty(value: Excel.CellValue, field: string): void | string {
    if (!value) return 'El campo ' + field + 'es Obligatorio';
  }
  validateFormatNumber(value: Excel.CellValue, field: string): void | string {
    if (isNaN(Number(value))) return 'El campo ' + field + ' no es Numero';
  }
  isValidTotalDays(
    dateInit: Date,
    endDate: Date,
    daysTotal: number,
  ): void | string {
    const total = CalculateDaysTraveler.calculateNumberDays(endDate, dateInit);
    if (total != daysTotal)
      return 'Hay Error en el calculo de los dias de alto riesgo';
  }
  isValidAmountCoverageDays(
    coverage: CoverageEntity,
    days: number,
    totalAmount: number,
  ): void | string {
    if (
      CalculateDaysTraveler.totalAmountCoveredDays(coverage, days) !=
      totalAmount
    )
      return 'Hay Error en el calculo importe de dias cubiertos';
  }
}
