import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from '../../data/api';
import toast from 'react-hot-toast';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCat, setCurrentCat] = useState({ _id: '', name: '', description: '' });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await apiGetCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async () => {
        try {
            if (editMode) {
                await apiUpdateCategory(currentCat._id, { name: currentCat.name, description: currentCat.description });
            } else {
                await apiCreateCategory({ name: currentCat.name, description: currentCat.description });
            }
            toast.success(editMode ? 'Category updated!' : 'Category added!');
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category', error);
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await apiDeleteCategory(id);
                fetchCategories();
            } catch (error) {
                console.error("Failed to delete category", error);
            }
        }
    };

    const openEdit = (cat) => {
        setCurrentCat(cat);
        setEditMode(true);
        setShowModal(true);
    };

    const openAdd = () => {
        setCurrentCat({ _id: '', name: '', description: '' });
        setEditMode(false);
        setShowModal(true);
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-wrap gap-3">
                <h3 className="font-bold text-white">Categories ({categories.length})</h3>
                <button onClick={openAdd} className="btn-primary text-xs">
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>
            {loading ? <div className="p-5 text-gray-400">Loading Categories...</div> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-left font-semibold">Products Count</th>
                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {categories.map(c => (
                                <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-gray-400">{c.description || 'N/A'}</td>
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
                                <tr>
                                    <td colSpan="4" className="p-5 text-center text-gray-500">No categories found.</td>
                                </tr>
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
                            <h3 className="font-bold text-white text-lg">
                                {editMode ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Name</label>
                                <input value={currentCat.name} onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })} placeholder="e.g. Displays" className="w-full input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description (optional)</label>
                                <input value={currentCat.description} onChange={e => setCurrentCat({ ...currentCat, description: e.target.value })} placeholder="Original OLED screens" className="w-full input-field" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-800 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
