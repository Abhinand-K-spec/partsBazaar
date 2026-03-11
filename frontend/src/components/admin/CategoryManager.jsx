import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from 'lucide-react';
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory, apiUploadImage } from '../../data/api';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_BASE}${img}`;
};

const EMPTY = { _id: '', name: '', description: '', image: '' };

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCat, setCurrentCat] = useState(EMPTY);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await apiGetCategories();
            setCategories(data.categories || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const openAdd = () => {
        setCurrentCat(EMPTY);
        setImageFile(null);
        setImagePreview(null);
        setEditMode(false);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setCurrentCat(cat);
        setImageFile(null);
        setImagePreview(getImageUrl(cat.image) || null);
        setEditMode(true);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!currentCat.name.trim()) {
            toast.error('Category name is required');
            return;
        }
        setSaving(true);
        const tid = toast.loading(editMode ? 'Updating...' : 'Adding...');
        try {
            let imagePath = currentCat.image || '';

            // Upload new image if selected
            if (imageFile) {
                const fd = new FormData();
                fd.append('image', imageFile);
                const { data } = await apiUploadImage(fd);
                imagePath = data.imagePath;
            }

            const payload = {
                name: currentCat.name.trim(),
                description: currentCat.description.trim(),
                image: imagePath,
            };

            if (editMode) {
                await apiUpdateCategory(currentCat._id, payload);
            } else {
                await apiCreateCategory(payload);
            }

            toast.success(editMode ? 'Category updated!' : 'Category added!', { id: tid });
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving category', { id: tid });
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await apiDeleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch {
            toast.error('Failed to delete category');
        }
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-wrap gap-3">
                <h3 className="font-bold text-white">Categories ({categories.length})</h3>
                <button onClick={openAdd} className="btn-primary text-xs">
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {loading ? (
                <div className="p-5 text-gray-400">Loading Categories...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs">
                            <tr>
                                {['Image', 'Name', 'Description', 'Products', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {categories.map(c => (
                                <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        {c.image ? (
                                            <img src={getImageUrl(c.image)} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-gray-400">{c.description || '—'}</td>
                                    <td className="px-4 py-3 text-gray-300">{c.count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan="5" className="p-5 text-center text-gray-500">No categories yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <h3 className="font-bold text-white text-lg">{editMode ? 'Edit Category' : 'Add Category'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category Image</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group"
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                                <span className="text-white text-xs ml-2">Change Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                            <p className="text-xs text-gray-400">Click to upload image</p>
                                            <p className="text-xs text-gray-600 mt-0.5">JPG, PNG, WebP up to 5MB</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name *</label>
                                <input
                                    value={currentCat.name}
                                    onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })}
                                    placeholder="e.g. Displays"
                                    className="w-full input-field"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description (optional)</label>
                                <input
                                    value={currentCat.description}
                                    onChange={e => setCurrentCat({ ...currentCat, description: e.target.value })}
                                    placeholder="e.g. Original OLED & LCD screens"
                                    className="w-full input-field"
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-800 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
