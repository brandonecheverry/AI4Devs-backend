import { Request, Response } from 'express';
import { addCandidate, findCandidateById, findCandidatesByPositionId, updateCandidateStage } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCandidatesByPositionId = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.positionId);
        
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'El ID de la posición debe ser un número válido' 
            });
        }

        const candidates = await findCandidatesByPositionId(positionId);
        
        return res.status(200).json({
            success: true,
            data: candidates
        });
        
    } catch (error) {
        console.error('Error al obtener candidatos por posición:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener los candidatos'
        });
    }
};

const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { currentInterviewStep } = req.body;

        if (isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de aplicación inválido'
            });
        }

        if (!currentInterviewStep || typeof currentInterviewStep !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un ID de etapa válido'
            });
        }

        const result = await updateCandidateStage(applicationId, { currentInterviewStep });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error al actualizar la etapa del candidato:', error);
        
        if (error instanceof Error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la etapa'
        });
    }
};

export { addCandidate, updateCandidateStageController as updateCandidateStage };