import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperience.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

export const findCandidatesByPositionId = async (positionId: number) => {
    const candidates = await prisma.application.findMany({
        where: {
            positionId: positionId
        },
        select: {
            candidate: {
                select: {
                    firstName: true,
                    lastName: true,
                }
            },
            currentInterviewStep: true,
            interviews: {
                select: {
                    score: true
                }
            }
        }
    });

    return candidates.map((application: { candidate: { firstName: any; lastName: any; }; interviews: any[]; currentInterviewStep: any; }) => {
        const fullName = `${application.candidate.firstName} ${application.candidate.lastName}`;
        const scores = application.interviews
            .map(interview => interview.score)
            .filter((score): score is number => score !== null);
        
        const averageScore = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;

        return {
            fullName,
            currentInterviewStep: application.currentInterviewStep,
            averageScore: Math.round(averageScore * 100) / 100
        };
    });
};

interface UpdateStageDto {
    currentInterviewStep: number;
}

interface UpdateStageResponse {
    id: number;
    candidateName: string;
    currentStep: string;
}

export const updateCandidateStage = async (
    applicationId: number, 
    updateData: UpdateStageDto
): Promise<UpdateStageResponse> => {
    // Primero verificamos que la aplicación existe
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            position: {
                include: {
                    interviewFlow: {
                        include: {
                            interviewSteps: true
                        }
                    }
                }
            }
        }
    });

    if (!application) {
        throw new Error('Aplicación no encontrada');
    }

    // Verificamos que el nuevo paso existe en el flujo de entrevistas de la posición
    const isValidStep = application.position.interviewFlow.interviewSteps
        .some((step: { id: number; }) => step.id === updateData.currentInterviewStep);

    if (!isValidStep) {
        throw new Error('Paso de entrevista inválido para este flujo');
    }

    // Actualizamos la etapa
    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: {
            currentInterviewStep: updateData.currentInterviewStep
        },
        include: {
            interviewStep: true,
            candidate: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    return {
        id: updatedApplication.id,
        candidateName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
        currentStep: updatedApplication.interviewStep.name
    };
};
