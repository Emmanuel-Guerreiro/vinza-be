import { auditEmitter } from "@/audit/event";
import { sequelize } from "@/db";
import { errors } from "@/error";
//import { Recorrido} from "@/recorrido/model";
//import {instanciaEvento} from "@/instancia-evento/model";
import {Op, WhereOptions} from "sequelize";
import { Reserva } from "./model";
import { CreateReservaDto, FindAllParams, UpdateReservaDto } from "./types";
import logger from "@/logger";
import { PaginatedResponse } from "@/pagination/types";
import {
  generatePaginationParams,
  generateOrderConditions,
} from "@/pagination";
import { Evento } from "@/evento/model";
import { EstadoInstanciaEvento } from "@/estado-instancia-evento/model";

class ReservaService {
    public async create(dto: CreateReservaDto) {
        const transaction = await sequelize.transaction();
        try{
          if (!dto.instanciaEventoId) {
            throw errors.app.reserva.not_found;}
         if (!dto.recorridoId){
            throw errors.app.reserva.not_found;
         }
         const EventoReserva = await Evento.findByPk(dto.instanciaEventoId);
          if (!EventoReserva) {
              throw { message: 'Instancia de evento no encontrada', status: 404 };
          }
         let cupos = EventoReserva?.cupos; 
         if (dto.cantidadGente > cupos) {
            throw { message: 'Cantidad de gente excede los cupos disponibles', status: 400 };
         }
            let reserva = await Reserva.create(dto,{ transaction });

          
        }catch{
            await transaction.rollback();
            throw errors.app.reserva.create_error;
        }
}}
export const reservaService = new ReservaService();
export type IReservaService = typeof reservaService;