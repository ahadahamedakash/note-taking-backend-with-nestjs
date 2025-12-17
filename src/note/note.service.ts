/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from 'src/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

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

  async findOne(id: number, userId: number) {
    const note = await this.prismaService.note.findFirst({ where: { id } });

    if (!note) {
      throw new NotFoundException('Not found!');
    }

    if (note?.userId !== userId) {
      throw new ForbiddenException('Not Allowed!');
    }
  }

  async update(id: number, updateNoteDto: UpdateNoteDto, userId: number) {
    const note = await this.prismaService.note.findFirst({ where: { id } });

    if (!note) {
      throw new NotFoundException('Not found!');
    }

    if (note?.userId !== userId) {
      throw new ForbiddenException('Not Allowed!');
    }

    const updated = await this.prismaService.note.update({
      where: { id },
      data: updateNoteDto,
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    try {
      return await this.prismaService.note.delete({ where: { id, userId } });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new ForbiddenException();
        }

        throw err;
      }
    }
  }
}
