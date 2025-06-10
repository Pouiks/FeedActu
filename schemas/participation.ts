// Enregistrer une participation
await supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: user.id,
    crm_id: user.crm_id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    residence_id: currentResidenceId
  });
  
  // Ajouter une réaction
  await supabase.from('publication_reactions').upsert({
    user_id: user.id,
    publication_type: 'post',
    publication_id: postId,
    reaction_type: 'like',
    residence_id: currentResidenceId
  });
  
  // Enregistrer une vue
  await supabase.rpc('record_publication_view', {
    p_user_id: user.id,
    p_publication_type: 'event',
    p_publication_id: eventId,
    p_residence_id: currentResidenceId,
    p_session_id: sessionId
  });