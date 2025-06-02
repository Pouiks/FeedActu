import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mockPosts = [
  { id: 1, title: 'Post A', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, title: 'Post C', publicationDate: '2024-05-06T02:00:00', status: 'Archivé', residence_id: '1' },
];

export default function Posts() {
  const { residenceId } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const navigate = useNavigate();

  const columns = [
    { id: 'title', label: 'Titre', sortable: true, searchable: true },
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
        <button onClick={() => setOpenModal(true)}>Nouveau</button>
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
          { name: 'title', label: 'Titre', type: 'text', required: true },
          { name: 'message', label: 'Message', type: 'wysiwyg', required: true },
          { name: 'imageUrl', label: "URL de l'image", type: 'text', required: false },
        ]}
      />
    </>
  );
}
