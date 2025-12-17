/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NoteService {
  private logger = new Logger(NoteService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    const note = await this.prismaService.note.create({
      data: {
        title: createNoteDto.title,
        body: createNoteDto.body,
        userId,
      },
    });

    this.logger.log(`New note has been created ${note.id}`);

    return note;
  }

  findAll({ skip, take }: { skip: number; take: number }, userId: number) {
    const notes = this.prismaService.note.findMany({
      skip,
      take,
      where: { userId },
    });

    return notes;
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    console.log(updateNoteDto);
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
