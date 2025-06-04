import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResidence } from '../context/ResidenceContext';

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
  const { ensureAuthenticated, authenticatedPost, authorizedResidences } = useAuth();
  const { currentResidenceId } = useResidence();
  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'category', label: 'Catégorie', sortable: true, searchable: false },
    { id: 'targetResidenceNames', label: 'Résidences', sortable: false, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  // Filtrer les posts : afficher ceux qui concernent la résidence actuelle
  const filteredPosts = posts.filter(post => {
    // Nouveau filtrage : afficher les posts qui ciblent la résidence actuelle
    return post.targetResidences && post.targetResidences.includes(currentResidenceId);
  });

  const handleAddPost = async (newPost) => {
    try {
      // Vérifier l'authentification avant de procéder
      ensureAuthenticated('créer un nouveau post');
      
      console.log('✅ Utilisateur authentifié, création du post...');
      console.log('📝 Données du post:', newPost);
      
      // Validation de sécurité des résidences
      if (!newPost.targetResidences || newPost.targetResidences.length === 0) {
        throw new Error('Aucune résidence sélectionnée pour la publication');
      }

      // Vérifier que l'utilisateur a accès à toutes les résidences sélectionnées
      const authorizedIds = authorizedResidences?.map(r => r.residenceId) || [];
      const unauthorizedResidences = newPost.targetResidences.filter(id => !authorizedIds.includes(id));
      
      if (unauthorizedResidences.length > 0) {
        console.error('🚨 SÉCURITÉ: Tentative de publication dans des résidences non autorisées:', unauthorizedResidences);
        throw new Error('Vous n\'êtes pas autorisé à publier dans certaines résidences sélectionnées');
      }
      
      // Utiliser le middleware pour une action authentifiée
      const result = await authenticatedPost('/api/posts', newPost);
      
      console.log('✅ Post créé avec succès:', result);
      
      // Ajouter le post à l'état local (simulation)
      const postWithId = { 
        ...newPost, 
        id: Date.now(),
        residence_id: currentResidenceId // Garder pour compatibilité ascendante
      };
      setPosts(prev => [...prev, postWithId]);
      
      // Fermer le modal et afficher une notification
      setOpenModal(false);
      const residenceCount = newPost.targetResidences.length;
      setNotification({
        open: true,
        message: `Post créé avec succès et publié dans ${residenceCount} résidence${residenceCount > 1 ? 's' : ''} !`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du post:', error);
      
      let errorMessage = 'Erreur lors de la création du post';
      
      if (error.code === 'UNAUTHENTICATED') {
        errorMessage = 'Vous devez être connecté pour créer un post';
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

  const handleRowClick = (post, navigate) => {
    navigate(`/posts/${post.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Posts de ma résidence</h2>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={handleNewPostClick}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Nouveau Post
        </Button>
      </div>

      <DataTable 
        title="Posts de ma résidence" 
        data={filteredPosts} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddPost}
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
            label: "URL de l'image", 
            type: 'url', 
            required: false,
            placeholder: 'https://exemple.com/image.jpg',
            helperText: 'URL complète vers une image (optionnel)'
          },
          {
            name: 'category',
            label: 'Catégorie',
            type: 'select',
            required: false,
            options: [
              { value: 'info', label: 'Information' },
              { value: 'event', label: 'Événement' },
              { value: 'urgent', label: 'Urgent' }
            ]
          }
        ]}
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
    </>
  );
}
