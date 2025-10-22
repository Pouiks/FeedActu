import React, { useState, useCallback } from 'react';
import { Button, Alert, Snackbar, Box, Card, CardContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useResidence } from '../context/ResidenceContext';
import { usePublications } from '../context/PublicationsContext';
import { getStandardColumns } from '../utils/publicationNormalizer';

const mockPosts = [
  { 
    id: 1, 
    title: 'Informations importantes sur les travaux', 
    message: '<p>Les travaux de rénovation de la <strong>cage d\'escalier</strong> débuteront lundi prochain. Merci de votre compréhension.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/4CAF50/white?text=Travaux',
    category: 'info', 
    publicationDate: '2024-11-20T08:00:00', 
    status: 'Publié', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1',
    targetResidences: ['19f2179b-7d14-f011-998a-6045bd1919a1'],
    targetResidenceNames: ['ECLA GENEVE ARCHAMPS']
  },
  { 
    id: 2, 
    title: 'Fête des voisins 2024', 
    message: '<p>Rejoignez-nous pour la <em>fête des voisins</em> ! 🎉<br>Au programme : barbecue, jeux pour enfants et bonne ambiance !</p>',
    imageUrl: 'https://via.placeholder.com/400x200/2196F3/white?text=Fête+Voisins',
    category: 'event', 
    publicationDate: '2024-11-18T14:30:00', 
    status: 'Publié', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['195644a8-4fa7-ef11-b8e9-6045bd19a503', '1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA MASSY-PALAISEAU', 'ECLA NOISY-LE-GRAND']
  },
  { 
    id: 3, 
    title: 'URGENT - Coupure d\'eau programmée', 
    message: '<p><strong style="color: red;">ATTENTION :</strong> Coupure d\'eau prévue demain de 9h à 16h pour maintenance du réseau.</p>',
    imageUrl: '',
    category: 'urgent', 
    publicationDate: '2024-11-21T18:45:00', 
    status: 'Publié', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1',
    targetResidences: ['19f2179b-7d14-f011-998a-6045bd1919a1', '195644a8-4fa7-ef11-b8e9-6045bd19a503', '1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA GENEVE ARCHAMPS', 'ECLA MASSY-PALAISEAU', 'ECLA NOISY-LE-GRAND']
  },
  { 
    id: 4, 
    title: 'Assemblée générale annuelle', 
    message: '<p>Convocation à l\'assemblée générale annuelle.<br><br>Ordre du jour :<br>- Vote du budget<br>- Élection du conseil syndical<br>- Travaux à prévoir</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-12-15T10:00:00', 
    status: 'Programmé', 
    residence_id: '195644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['195644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA MASSY-PALAISEAU']
  },
  { 
    id: 5, 
    title: 'Soirée jeux de société', 
    message: '<p>Une soirée conviviale autour de jeux de société ! Apportez vos jeux préférés.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/9C27B0/white?text=Jeux+Société',
    category: 'event', 
    publicationDate: '2024-11-19T16:20:00', 
    status: 'Brouillon', 
    residence_id: '1b5644a8-4fa7-ef11-b8e9-6045bd19a503',
    targetResidences: ['1b5644a8-4fa7-ef11-b8e9-6045bd19a503'],
    targetResidenceNames: ['ECLA NOISY-LE-GRAND']
  },
  { 
    id: 6, 
    title: 'Règlement intérieur mis à jour', 
    message: '<p>Le nouveau règlement intérieur est disponible. Principales modifications concernant les horaires de tranquillité.</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-10-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '19f2179b-7d14-f011-998a-6045bd1919a1',
    targetResidences: ['19f2179b-7d14-f011-998a-6045bd1919a1'],
    targetResidenceNames: ['ECLA GENEVE ARCHAMPS']
  }
];

export default function Posts() {
  const { ensureAuthenticated, authorizedResidences } = useAuth();
  const { currentResidenceId } = useResidence();
  const { getNormalizedPublications, addPublication, publishDraft, updatePublication, deletePublication } = usePublications();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });


  // Colonnes standardisées pour les posts
  const columns = getStandardColumns('posts');

  // Récupération des posts normalisés
  const posts = getNormalizedPublications('posts', currentResidenceId);

  // NOUVEAU : Publier un brouillon
  const handlePublishDraft = useCallback(async (post) => {
    try {
      ensureAuthenticated('publier un brouillon');
      
      await publishDraft('posts', post.id);
      
      setNotification({
        open: true,
        message: `Brouillon "${post.title}" publié avec succès !`,
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la publication du brouillon:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la publication du brouillon',
        severity: 'error'
      });
    }
  }, [ensureAuthenticated, publishDraft]);

  // NOUVEAU : Modifier un post (réutilise le modal existant)
  const handleEditPost = useCallback((post) => {
    try {
      ensureAuthenticated('modifier un post');
      setEditingPost(post);
      setOpenModal(true);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour modifier un post',
        severity: 'error'
      });
    }
  }, [ensureAuthenticated]);

  // NOUVEAU : Supprimer un post
  const handleDeletePost = useCallback(async (post) => {
    try {
      ensureAuthenticated('supprimer un post');
      
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${post.title}" ?`)) {
        await deletePublication('posts', post.id);
        
        setNotification({
          open: true,
          message: `Post "${post.title}" supprimé avec succès !`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      setNotification({
        open: true,
        message: error.message || 'Erreur lors de la suppression',
        severity: 'error'
      });
    }
  }, [ensureAuthenticated, deletePublication]);


  // Gérer la soumission du formulaire (création OU mise à jour)
  const handleSubmitPost = async (postData) => {
    try {
      // Vérifier l'authentification avant de procéder
      ensureAuthenticated(editingPost ? 'modifier un post' : 'créer un nouveau post');
      
      // Validation de sécurité des résidences (nouveau format: residenceIds)
      const residenceIds = postData.residenceIds || postData.targetResidences || [];
      if (!residenceIds || residenceIds.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      // Vérifier que l'utilisateur a accès à toutes les résidences sélectionnées
      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = residenceIds.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      if (editingPost) {
        // Mise à jour d'un post existant
        await updatePublication('posts', editingPost.id, postData);
        setNotification({
          open: true,
          message: `Post "${postData.title}" mis à jour avec succès !`,
          severity: 'success'
        });
      } else {
        // Création d'un nouveau post (logique existante)
        await addPublication('posts', postData);
        const residenceCount = residenceIds.length;
        setNotification({
          open: true,
          message: `Post créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
          severity: 'success'
        });
      }
      
      setOpenModal(false);
      setEditingPost(null);
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      let errorMessage = editingPost ? 'Erreur lors de la mise à jour du post' : 'Erreur lors de la création du post';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour effectuer cette action';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleNewPostClick = () => {
    try {
      // Vérifier l'authentification avant d'ouvrir le modal
      ensureAuthenticated('créer un nouveau post');
      
      // Vérifier que l'utilisateur a des résidences autorisées
      if (!authorizedResidences || authorizedResidences.length === 0) {
        setNotification({
          open: true,
          message: 'Vous n\'avez accès à aucune résidence pour publier',
          severity: 'warning'
        });
        return;
      }
      
      setEditingPost(null); // S'assurer qu'on est en mode création
      setOpenModal(true);
    } catch (error) {
      console.error('❌ Utilisateur non authentifié:', error);
      setNotification({
        open: true,
        message: 'Vous devez être connecté pour créer un post',
        severity: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPost(null);
  };


  const handleRowClick = (post) => {
    // Naviguer vers la page de détail au lieu d'ouvrir le modal d'édition
    navigate(`/posts/${post.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      {/* En-tête moderne style Directus */}
      <PageHeader
        title="Posts"
        subtitle="Gérez vos publications et communications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Posts', href: '/posts' }
        ]}
        actions={[
          {
            label: 'Nouveau Post',
            icon: <Add />,
            variant: 'contained',
            props: {
              onClick: handleNewPostClick
            }
          }
        ]}
        stats={[
          { label: 'Total', value: posts.length },
          { label: 'Publiés', value: posts.filter(p => p.status === 'Publié').length },
          { label: 'Brouillons', value: posts.filter(p => p.status === 'Brouillon').length }
        ]}
      />

      {/* Contenu principal dans une card */}
      <Card className="directus-card">
        <CardContent sx={{ p: 0 }}>
          <DataTable
            className="directus-table"
            data={posts}
            columns={columns}
            onRowClick={handleRowClick}
            showActions={true} // NOUVEAU : Activer les actions
            onPublishDraft={handlePublishDraft} // NOUVEAU
            onEditItem={handleEditPost} // NOUVEAU
            onDeleteItem={handleDeletePost} // NOUVEAU
            searchPlaceholder="Rechercher dans les posts..."
            emptyStateMessage="Aucun post trouvé pour cette résidence"
            sx={{
              '& .MuiTable-root': {
                backgroundColor: 'transparent'
              },
              '& .MuiTableHead-root': {
                backgroundColor: 'var(--theme-background-accent)'
              },
              '& .MuiTableCell-head': {
                fontWeight: 600,
                color: 'var(--theme-foreground-normal-alt)',
                borderBottom: '1px solid var(--theme-border-subdued)'
              },
              '& .MuiTableBody-root .MuiTableRow-root:hover': {
                backgroundColor: 'var(--theme-background-normal-alt)'
              }
            }}
          />
        </CardContent>
      </Card>

      <ModalPublicationForm
        open={openModal}
        handleClose={handleCloseModal}
        onSubmit={handleSubmitPost}
        entityName="Post"
        fields={[
          { 
            name: 'title', 
            label: 'Titre', 
            type: 'text', 
            required: true,
            placeholder: 'Entrez le titre du post...'
          },
          { 
            name: 'message', 
            label: 'Message', 
            type: 'wysiwyg', 
            required: true 
          },
          { 
            name: 'imageUrl', 
            label: "Image", 
            type: 'image', 
            required: false,
            placeholder: 'https://exemple.com/image.jpg',
            helperText: 'Chargez un fichier ou collez une URL d\'image'
          },
          {
            name: 'category',
            label: 'Catégorie',
            type: 'select',
            required: false,
            options: [
              { value: 'info', label: 'Information' },
              { value: 'event', label: 'Événement' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'community', label: 'Vie communautaire' }
            ]
          },
          { 
            name: 'pinned', 
            label: 'Épingler ce post', 
            type: 'checkbox',
            required: false,
            helperText: 'Le post apparaîtra en haut de la liste dans l\'app mobile'
          },
          { 
            name: 'publicationDate', 
            label: 'Date de publication', 
            type: 'datetime', 
            required: true,
            helperText: 'Date et heure de publication du post'
          }
        ]}
        initialValues={editingPost || {}}
        isEditing={!!editingPost}
      />


      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
