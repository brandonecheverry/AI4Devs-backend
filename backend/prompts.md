# Prompts Utilizados

GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

para verificar si la consulta SQL esta bien lo puedes hacer basandote del siguiente archivo de migration @migration.sql y tambien del schema.prisma @schema.prisma

tienes este error: 'updateCandidateStage' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.ts(7023) con updateCandidateStage