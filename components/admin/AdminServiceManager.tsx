'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Loader2, Package, Key } from 'lucide-react';
import { Service } from '@/lib/types';
import { addService, updateService, deleteService, addDigitalKey, getDigitalKeys, deleteDigitalKey } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminServiceManagerProps {
  initialServices: Service[];
}

export default function AdminServiceManager({ initialServices }: AdminServiceManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [digitalKeys, setDigitalKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    icon: '🎬',
    category: 'Streaming',
    stock: 100
  });

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      price: 0,
      description: '',
      icon: '🎬',
      category: 'Streaming',
      stock: 100
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      description: service.description,
      icon: service.icon,
      category: service.category,
      stock: service.stock
    });
    setIsModalOpen(true);
  };

  const openKeyModal = async (service: Service) => {
    setSelectedService(service);
    setIsKeyModalOpen(true);
    setKeyLoading(true);
    try {
      const result = await getDigitalKeys(service.id);
      if (result.success) {
        setDigitalKeys(result.keys || []);
      } else {
        alert(result.error || "Failed to fetch keys");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while fetching keys");
    } finally {
      setKeyLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !newKey) return;
    setKeyLoading(true);
    try {
      const result = await addDigitalKey(selectedService.id, newKey);
      if (result.success) {
        setNewKey('');
        const refresh = await getDigitalKeys(selectedService.id);
        setDigitalKeys(refresh.keys || []);
      } else {
        alert(result.error || "Failed to add key");
      }
    } catch (error) {
      alert("Failed to add key due to a network or server error");
    } finally {
      setKeyLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!selectedService) return;
    setKeyLoading(true);
    try {
      const result = await deleteDigitalKey(id, selectedService.id);
      if (result.success) {
        const refresh = await getDigitalKeys(selectedService.id);
        setDigitalKeys(refresh.keys || []);
      }
    } catch (error) {
      alert("Failed to delete key");
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        const result = await updateService(editingService.id, formData);
        if (result.success) {
          setIsModalOpen(false);
          window.location.reload();
        } else {
          alert(result.error);
        }
      } else {
        const result = await addService(formData);
        if (result.success) {
          setIsModalOpen(false);
          window.location.reload();
        } else {
          alert(result.error);
        }
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    setLoading(true);
    try {
      const result = await deleteService(id);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">Active Subscriptions</h2>
        <button
          onClick={openAddModal}
          className="brutalist-button bg-brutalist-green text-black flex items-center gap-2 px-6 py-3 font-black uppercase text-sm"
        >
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div className="brutalist-card bg-white border-[3px] border-black overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white uppercase text-xs font-black">
            <tr>
              <th className="p-4 border-r border-white/20">Icon</th>
              <th className="p-4 border-r border-white/20">Name</th>
              <th className="p-4 border-r border-white/20">Category</th>
              <th className="p-4 border-r border-white/20">Price (NPR)</th>
              <th className="p-4 border-r border-white/20">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="font-bold text-sm">
            {services.map((service) => (
              <tr key={service.id} className="border-b-[2px] border-black hover:bg-gray-50 transition-colors">
                <td className="p-4 border-r border-black">
                  <div className="w-10 h-10 bg-brutalist-yellow border-[2px] border-black flex items-center justify-center text-xl">
                    {service.icon}
                  </div>
                </td>
                <td className="p-4 border-r border-black uppercase tracking-tight">{service.name}</td>
                <td className="p-4 border-r border-black">
                  <span className="bg-black text-white text-[10px] px-2 py-1 uppercase">{service.category}</span>
                </td>
                <td className="p-4 border-r border-black font-black">{service.price}</td>
                <td className="p-4 border-r border-black">
                  <span className={`font-black ${service.stock <= 5 ? 'text-red-600' : ''}`}>
                    {service.stock <= 0 ? 'OUT OF STOCK' : service.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openKeyModal(service)}
                      title="Manage Keys"
                      className="p-2 bg-brutalist-yellow border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 bg-brutalist-cyan border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 bg-brutalist-magenta text-white border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Service */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-8 relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-brutalist-yellow border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>

              <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">
                {editingService ? 'Update' : 'Add New'} <span className="text-brutalist-cyan">Subscription</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase">Service Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="brutalist-input w-full"
                      placeholder="Netflix Premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase">Price (NPR)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="brutalist-input w-full"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="brutalist-input w-full min-h-[100px]"
                    placeholder="Short description of the service..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="brutalist-input w-full"
                    >
                      <option>Streaming</option>
                      <option>Music</option>
                      <option>Design</option>
                      <option>AI</option>
                      <option>Gaming</option>
                      <option>Utility</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase">Stock Limit (Auto-calculated from keys)</label>
                    <input
                      readOnly
                      disabled
                      type="number"
                      value={formData.stock}
                      className="brutalist-input w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Icon (Emoji)</label>
                  <input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="brutalist-input w-full text-center text-xl"
                    placeholder="🎬"
                  />
                </div>

                <div className="pt-6 border-t-[3px] border-black flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 brutalist-button bg-white py-3 font-black uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 brutalist-button bg-black text-white py-3 font-black uppercase flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : editingService ? <Save size={18} /> : <Plus size={18} />}
                    {editingService ? 'Save Changes' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Managing Digital Keys */}
      <AnimatePresence>
        {isKeyModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full p-8 relative"
            >
              <button
                onClick={() => {
                  setIsKeyModalOpen(false);
                  window.location.reload(); // Refresh to update stock in main list
                }}
                className="absolute top-4 right-4 p-1 hover:bg-brutalist-yellow border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                Manage Keys for <span className="text-brutalist-magenta">{selectedService.name}</span>
              </h3>
              <p className="text-xs font-bold text-gray-500 mb-8 uppercase">Current Stock: {digitalKeys.length} available keys</p>

              <form onSubmit={handleAddKey} className="flex gap-2 mb-8">
                <input
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="brutalist-input flex-1"
                  placeholder="Enter new digital key/code..."
                />
                <button
                  type="submit"
                  disabled={keyLoading}
                  className="brutalist-button bg-brutalist-green px-6 font-black uppercase text-xs flex items-center gap-2"
                >
                  {keyLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Add
                </button>
              </form>

              <div className="border-[3px] border-black max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black text-white uppercase text-[10px] font-black sticky top-0">
                    <tr>
                      <th className="p-3">Key Content</th>
                      <th className="p-3">Added Date</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-xs divide-y-2 divide-black">
                    {digitalKeys.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400 uppercase">No keys in inventory</td>
                      </tr>
                    ) : (
                      digitalKeys.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono">{k.key}</td>
                          <td className="p-3 text-gray-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="p-1.5 bg-red-100 text-red-600 border-[2px] border-black hover:bg-red-200 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-6 border-t-[3px] border-black">
                <button
                  onClick={() => {
                    setIsKeyModalOpen(false);
                    window.location.reload();
                  }}
                  className="w-full brutalist-button bg-black text-white py-3 font-black uppercase"
                >
                  Close & Sync Stock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
