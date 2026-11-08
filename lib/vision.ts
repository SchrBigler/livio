import {z} from 'zod';
const detection=(values:readonly [string,...string[]])=>z.object({value:z.enum(values),confidence:z.number().min(0).max(1),evidence:z.string().max(1500).default('')});
export const Analysis=z.object({summary:z.string().max(2000),detections:z.object({
  element:detection(['Fenster','Balkontuere','Schiebetuere','Dachfenster','Lichtschacht','unklar']),
  material:detection(['Holz','Holz-Alu','Kunststoff','unklar']),
  geometry:detection(['flaechenversetzt','flaechenbuendig','unklar']),
  shading:detection(['Raffstore','Rollladen','Jalousie','keine','unklar']),
  opening:detection(['Dreh','Dreh-Kipp','Kipp','Schiebe','fest','unklar']).optional(),
  obstacles:z.array(z.string().max(500)).max(20).default([]),
}),recommendation:z.object({customerProduct:z.string().max(100),internalVariant:z.literal('unklar').default('unklar'),mesh:z.enum(['TTA','TFP','FA','unklar']),reason:z.string().max(2000)}),
missingPhotos:z.array(z.string().max(500)).max(20),openQuestions:z.array(z.string().max(500)).max(20),warnings:z.array(z.string().max(500)).max(20)});
export type VisionResult=z.infer<typeof Analysis>;
