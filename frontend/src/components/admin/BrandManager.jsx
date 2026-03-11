import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from 'lucide-react';
import { apiGetBrands, apiCreateBrand, apiUpdateBrand, apiDeleteBrand, apiUploadImage } from '../../data/api';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_BASE}${img}`;
};

const EMPTY = { _id: '', name: '', image: '' };

export default function BrandManager() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(EMPTY);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const { data } = await apiGetBrands();
            setBrands(data.brands || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const openAdd = () => {
        setCurrentBrand(EMPTY);
        setImageFile(null);
        setImagePreview(null);
        setEditMode(false);
        setShowModal(true);
    };

    const openEdit = (brand) => {
        setCurrentBrand(brand);
        setImageFile(null);
        setImagePreview(getImageUrl(brand.image) || null);
        setEditMode(true);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!currentBrand.name.trim()) {
            toast.error('Brand name is required');
            return;
        }
        setSaving(true);
        const tid = toast.loading(editMode ? 'Updating...' : 'Adding...');
        try {
            let imagePath = currentBrand.image || '';

            if (imageFile) {
                const fd = new FormData();
                fd.append('image', imageFile);
                const { data } = await apiUploadImage(fd);
                imagePath = data.imagePath;
            }

            const payload = { name: currentBrand.name.trim(), image: imagePath };

            if (editMode) {
                await apiUpdateBrand(currentBrand._id, payload);
            } else {
                await apiCreateBrand(payload);
            }

            toast.success(editMode ? 'Brand updated!' : 'Brand added!', { id: tid });
            setShowModal(false);
            fetchBrands();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving brand', { id: tid });
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this brand?')) return;
        try {
            await apiDeleteBrand(id);
            toast.success('Brand deleted');
            fetchBrands();
        } catch {
            toast.error('Failed to delete brand');
        }
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-wrap gap-3">
                <h3 className="font-bold text-white">Brands ({brands.length})</h3>
                <button onClick={openAdd} className="btn-primary text-xs">
                    <Plus className="w-4 h-4" /> Add Brand
                </button>
            </div>

            {loading ? (
                <div className="p-5 text-gray-400">Loading Brands...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs">
                            <tr>
                                {['Logo', 'Name', 'Products', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {brands.map(b => (
                                <tr key={b._id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        {getImageUrl(b.image) ? (
                                            <img src={getImageUrl(b.image)} alt={b.name} className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-white font-medium">{b.name}</td>
                                    <td className="px-4 py-3 text-gray-300">{b.count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brands.length === 0 && (
                                <tr><td colSpan="4" className="p-5 text-center text-gray-500">No brands yet.</td></tr>
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
                            <h3 className="font-bold text-white text-lg">{editMode ? 'Edit Brand' : 'Add Brand'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Brand Logo</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 bg-gray-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group"
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                                <span className="text-white text-xs ml-2">Change Logo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                            <p className="text-xs text-gray-400">Click to upload brand logo</p>
                                            <p className="text-xs text-gray-600 mt-0.5">PNG with transparent bg recommended</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Brand Name *</label>
                                <input
                                    value={currentBrand.name}
                                    onChange={e => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                                    placeholder="e.g. Apple"
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
