// Prévisualisation complète avant publication
export function PublicationPreview({ data, type }) {
  const apiPayload = PublicationService.buildApiPayload(type, data);
  
  return (
    <Card>
      <CardHeader title="Aperçu de la publication" />
      <CardContent>
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
      </CardContent>
    </Card>
  );
} 