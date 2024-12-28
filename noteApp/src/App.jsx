import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image: null });
  const [editNoteId, setEditNoteId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://backend-flame-two.vercel.app/api/note/list');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        e.target.value = '';
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        e.target.value = '';
        return;
      }

      setForm({ ...form, image: file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setForm({ ...form, image: null });
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      let response;
      if (editNoteId) {
        formData.append('id', editNoteId);
        response = await axios.post('https://backend-flame-two.vercel.app/api/note/update', formData, config);
      } else {
        response = await axios.post('https://backend-flame-two.vercel.app/api/note/add', formData, config);
      }

      if (response.data.success) {
        setForm({ title: '', content: '', image: null });
        setPreviewUrl(null);
        setEditNoteId(null);
        fetchNotes();
      } else {
        alert(response.data.message || 'Error saving note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert(error.response?.data?.message || 'Error saving note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content, image: null });
    setEditNoteId(note._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true);
      try {
        await axios.post('https://backend-flame-two.vercel.app/api/note/remove', { id });
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderImage = (imageUrl) => {
    if (!imageUrl) return null;
    
    return (
      <div className="mb-4 relative rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Note"
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Notes App</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 transition-all hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                placeholder="Enter note title"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
                required
                placeholder="Enter note content"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {previewUrl && renderImage(previewUrl)}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : editNoteId ? 'Update Note' : 'Add Note'}
            </button>
          </form>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes && Array.isArray(notes) && notes.map((note) => (
            <div
              key={note._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all mb-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{note.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{note.content}</p>
              {renderImage(note.image)}

              <div className="text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
