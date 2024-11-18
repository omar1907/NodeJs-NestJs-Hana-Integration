import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create.report-dto';
import { Report } from './entity/report.entity';
import { User } from 'src/users/entity/user.entity';
import { GetEstimateDto } from './dto/get-estimate-dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  async create(reportDto: CreateReportDto, user: User) {
    const report = this.reportRepository.create(
      reportDto as DeepPartial<Report>,
    );
    report.user = user;

    return await this.reportRepository.save(report);
  }

  async getAll() {
    return await this.reportRepository.find();
  }
  async changeApprove(id: string, approved: boolean) {
    const report = await this.reportRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.approved = approved;
    return await this.reportRepository.save(report);
  }

  async getEstimate({ make, model, lng, year, mileage, lat }: GetEstimateDto) {
    return this.reportRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('year BETWEEN :minYear AND :maxYear', {
        minYear: year - 3,
        maxYear: year + 3,
      })
      .andWhere('lng BETWEEN :minLng AND :maxLng', {
        minLng: lng - 5,
        maxLng: lng + 5,
      })
      .andWhere('lat BETWEEN :minLat AND :maxLat', {
        minLat: lat - 5,
        maxLat: lat + 5,
      })
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
