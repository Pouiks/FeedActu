// src/components/RichTextEditor.js

import React, { useState } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../styles/RichTextEditor.css'; // On va le refaire clean aussi

export default function RichTextEditor({ value, onChange }) {
  const contentBlock = htmlToDraft(value || '');
  const contentState = ContentState.createFromBlockArray(
    contentBlock.contentBlocks,
    contentBlock.entityMap
  );

  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(contentState)
  );

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    onChange(html);
  };

  // Simuler un upload d'image local → on retourne une URL locale (pas de backend pour le moment)
  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ data: { link: e.target.result } });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Editor
      editorState={editorState}
      wrapperClassName="rich-editor-wrapper"
      editorClassName="rich-editor"
      toolbarClassName="rich-editor-toolbar"
      onEditorStateChange={handleEditorChange}
      toolbar={{
        options: [
          'inline',
          'blockType',
          'fontSize',
          'list',
          'textAlign',
          'colorPicker',
          'link',
          'embedded',
          'emoji',
          'image',
          'remove',
          'history'
        ],
        inline: {
          options: ['bold', 'italic', 'underline', 'strikethrough'],
        },
        list: {
          options: ['unordered', 'ordered'],
        },
        textAlign: {
          options: ['left', 'center', 'right', 'justify'],
        },
        image: {
          uploadEnabled: true,
          uploadCallback: uploadImageCallBack,
          previewImage: true,
          alt: { present: true, mandatory: false },
          inputAccept: 'image/*',
        },
      }}
    />
  );
}
