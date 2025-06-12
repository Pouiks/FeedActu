import { Card, CardHeader, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography, Alert } from '@mui/material';
import { PublicationLogger } from '../utils/publicationLogger';
import { useAuth } from '../context/AuthContext'; // Assurez-vous que ce chemin est correct
import { PublicationRenderer } from './PublicationRenderer';

// Prévisualisation complète avant publication
export function PublicationPreview({ data, type }) {
  const { user, authorizedResidences } = useAuth();
  
  // Construction du payload avec PublicationLogger
  const apiPayload = PublicationLogger.buildCompletePayload(type, data);
  
  // Validation de sécurité
  const securityCheck = PublicationLogger.validateSecurity(data, authorizedResidences);
  
  // Log de la prévisualisation
  const previewLog = PublicationLogger.logPublication(
    type,
    data,
    'PREPARING',
    { user, authorizedResidences },
    { isPreview: true }
  );

  return (
    <Card>
      <CardHeader 
        title="Aperçu de la publication" 
        subheader={`Type: ${type.toUpperCase()}`}
      />
      <CardContent>
        {/* Alerte de sécurité si nécessaire */}
        {!securityCheck.isValid && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Attention : Certaines résidences ne sont pas autorisées
          </Alert>
        )}
        
        {/* Prévisualisation visuelle */}
        <PublicationRenderer data={data} type={type} />
        
        {/* Données techniques */}
        <Accordion>
          <AccordionSummary>
            <Typography>Données techniques (API)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(apiPayload, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>

        {/* Informations de sécurité */}
        <Accordion>
          <AccordionSummary>
            <Typography>Validation de sécurité</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(securityCheck, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>

        {/* Métadonnées de log */}
        <Accordion>
          <AccordionSummary>
            <Typography>Métadonnées de log</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(previewLog.metadata, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
} 