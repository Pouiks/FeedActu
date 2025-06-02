import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockPosts = [
  { 
    id: 1, 
    title: 'Informations importantes sur les travaux', 
    message: '<p>Les travaux de rénovation de la <strong>cage d\'escalier</strong> débuteront lundi prochain. Merci de votre compréhension.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/4CAF50/white?text=Travaux',
    category: 'info', 
    publicationDate: '2024-11-20T08:00:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 2, 
    title: 'Fête des voisins 2024', 
    message: '<p>Rejoignez-nous pour la <em>fête des voisins</em> ! 🎉<br>Au programme : barbecue, jeux pour enfants et bonne ambiance !</p>',
    imageUrl: 'https://via.placeholder.com/400x200/2196F3/white?text=Fête+Voisins',
    category: 'event', 
    publicationDate: '2024-11-18T14:30:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 3, 
    title: 'URGENT - Coupure d\'eau programmée', 
    message: '<p><strong style="color: red;">ATTENTION :</strong> Coupure d\'eau prévue demain de 9h à 16h pour maintenance du réseau.</p>',
    imageUrl: '',
    category: 'urgent', 
    publicationDate: '2024-11-21T18:45:00', 
    status: 'Publié', 
    residence_id: '1' 
  },
  { 
    id: 4, 
    title: 'Assemblée générale annuelle', 
    message: '<p>Convocation à l\'assemblée générale annuelle.<br><br>Ordre du jour :<br>- Vote du budget<br>- Élection du conseil syndical<br>- Travaux à prévoir</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-12-15T10:00:00', 
    status: 'Programmé', 
    residence_id: '1' 
  },
  { 
    id: 5, 
    title: 'Soirée jeux de société', 
    message: '<p>Une soirée conviviale autour de jeux de société ! Apportez vos jeux préférés.</p>',
    imageUrl: 'https://via.placeholder.com/400x200/9C27B0/white?text=Jeux+Société',
    category: 'event', 
    publicationDate: '2024-11-19T16:20:00', 
    status: 'Brouillon', 
    residence_id: '1' 
  },
  { 
    id: 6, 
    title: 'Règlement intérieur mis à jour', 
    message: '<p>Le nouveau règlement intérieur est disponible. Principales modifications concernant les horaires de tranquillité.</p>',
    imageUrl: '',
    category: 'info', 
    publicationDate: '2024-10-15T12:00:00', 
    status: 'Archivé', 
    residence_id: '1' 
  }
];

export default function Posts() {
  const { residenceId } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
    { id: 'category', label: 'Catégorie', sortable: true, searchable: false },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredPosts = posts.filter(post => post.residence_id === residenceId);

  const handleAddPost = (newPost) => {
    const postWithId = { ...newPost, id: Date.now(), residence_id: residenceId };
    setPosts(prev => [...prev, postWithId]);
  };

  const handleRowClick = (post, navigate) => {
    navigate(`/posts/${post.id}`);
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
          onClick={() => setOpenModal(true)}
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
    </>
  );
}
