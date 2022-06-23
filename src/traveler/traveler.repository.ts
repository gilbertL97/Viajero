import { BadRequestException } from '@nestjs/common';
import { DateHelper } from 'src/common/helper/date.helper';
import { ContratorEntity } from 'src/contractor/entity/contrator.entity';
import { CountryEntity } from 'src/country/entities/country.entity';
import { CoverageEntity } from 'src/coverage/entities/coverage.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { TravelerEntity } from './entity/traveler.entity';

@EntityRepository(TravelerEntity)
export class TravelerRepository extends Repository<TravelerEntity> {
  public async findAll(): Promise<TravelerEntity[]> {
    return await this.find();
  }

  async createTraveler(
    createTravelerDto: CreateTravelerDto,
    coverage: CoverageEntity,
    contractor: ContratorEntity,
    nationality: CountryEntity,
    origin_country: CountryEntity,
  ): Promise<TravelerEntity> {
    const {
      name,
      email,
      passport,
      sale_date,
      start_date,
      end_date_policy,
      number_high_risk_days,
    } = createTravelerDto;
    const traveler = this.create({
      name,
      email,
      passport,
      sale_date,
      start_date,
      end_date_policy,
      number_high_risk_days,
      coverage,
      contractor,
      nationality,
      origin_country,
    });
    traveler.number_days = this.calculateNumberDays(createTravelerDto);
    traveler.amount_days_high_risk =
      this.totalAmountHighRisk(createTravelerDto);
    traveler.amount_days_covered = this.totalAmountCoveredDays(
      traveler.coverage,
      traveler.number_days,
    );
    traveler.total_amount = traveler.amount_days_covered;
    const newTraveler = await this.save(traveler).catch(() => {
      throw new BadRequestException('error in database');
    });
    return newTraveler;
  }

}
