'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Loader2, Package, Key, AlertTriangle, Search } from 'lucide-react';
import { Service } from '@/lib/types';
import { addService, updateService, deleteService, hardDeleteService, addDigitalKey, getDigitalKeys, deleteDigitalKey, toggleServiceStatus } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/Toast';
import { Eye, EyeOff } from 'lucide-react';

interface AdminServiceManagerProps {
  initialServices: Service[];
}

export default function AdminServiceManager({ initialServices }: AdminServiceManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [digitalKeys, setDigitalKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    icon: '🎬',
    category: 'Streaming',
    stock: 0,
    active: true,
    initialKeys: ''
  });

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      price: 0,
      description: '',
      icon: '🎬',
      category: 'Streaming',
      stock: 0,
      active: true,
      initialKeys: ''
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
      stock: service.stock,
      active: service.active ?? true,
      initialKeys: ''
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
        showToast(result.error || "Failed to fetch keys", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong while fetching keys", "error");
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
        showToast("Digital key added successfully", "success");
      } else {
        showToast(result.error || "Failed to add key", "error");
      }
    } catch (error) {
      showToast("Failed to add key due to a network or server error", "error");
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
        showToast("Key deleted", "success");
      }
    } catch (error) {
      showToast("Failed to delete key", "error");
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        const result = await updateService(editingService.id, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          stock: formData.stock
        });
        if (result.success) {
          setIsModalOpen(false);
          showToast("Service updated successfully", "success");
          window.location.reload();
        } else {
          showToast(result.error || "Update failed", "error");
        }
      } else {
        // Parse initial keys from newline-separated string
        const keysArray = formData.initialKeys
          .split('\n')
          .map(k => k.trim())
          .filter(k => k !== '');

        const result = await addService({
          name: formData.name,
          price: formData.price,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          stock: keysArray.length > 0 ? keysArray.length : 0,
          initialKeys: keysArray
        });

        if (result.success) {
          setIsModalOpen(false);
          showToast("Service created successfully", "success");
          window.location.reload();
        } else {
          showToast(result.error || "Creation failed", "error");
        }
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const result = await toggleServiceStatus(id, !currentStatus);
      if (result.success) {
        showToast(`Service ${!currentStatus ? 'enabled' : 'disabled'}`, "success");
        window.location.reload();
      } else {
        showToast(result.error || "Failed to toggle status", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disable this service? It will no longer be visible to customers.")) return;
    
    setLoading(true);
    try {
      const result = await deleteService(id);
      if (result.success) {
        showToast("Service disabled successfully", "success");
        window.location.reload();
      } else {
        showToast(result.error || "Failed to disable", "error");
      }
    } catch (error) {
      showToast("Failed to disable service", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("DANGER: This will PERMANENTLY delete the service and all its digital keys from the database. This cannot be undone. Are you absolutely sure?")) return;
    
    setLoading(true);
    try {
      const result = await hardDeleteService(id);
      if (result.success) {
        showToast("Service permanently deleted", "success");
        window.location.reload();
      } else {
        showToast(result.error || "Failed to delete", "error");
      }
    } catch (error) {
      showToast("Failed to permanently delete service", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Package className="text-brutalist-cyan" size={32} />
          Digital Inventory
        </h2>
        
        <div className="flex flex-col md:flex-row items-stretch gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutalist-input w-full pl-10 py-2 text-sm border-[2px] border-black"
            />
          </div>
          <button
            onClick={openAddModal}
            className="brutalist-button bg-brutalist-green text-black flex items-center justify-center gap-2 px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Plus size={18} /> New Service
          </button>
        </div>
      </div>

      <div className="brutalist-card bg-white border-[3px] border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black text-white uppercase text-[10px] font-black">
              <tr>
                <th className="p-4 border-r border-white/20">Condition</th>
                <th className="p-4 border-r border-white/20">Ident</th>
                <th className="p-4 border-r border-white/20">Service Designation</th>
                <th className="p-4 border-r border-white/20">Class</th>
                <th className="p-4 border-r border-white/20">Rate (NPR)</th>
                <th className="p-4 border-r border-white/20">Current Stock</th>
                <th className="p-4 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="font-bold text-sm">
              <AnimatePresence mode="popLayout">
                {filteredServices.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="p-20 text-center text-gray-400 uppercase font-black">
                      <div className="flex flex-col items-center gap-4">
                        <Search size={48} className="opacity-20" />
                        No digital assets found matching "{searchTerm}"
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredServices.map((service, idx) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      key={service.id} 
                      className={`border-b-[2px] border-black transition-colors ${!service.active ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-4 border-r border-black text-center">
                        <div className={`inline-block px-3 py-1 text-[9px] font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${service.active ? 'bg-brutalist-green' : 'bg-gray-400'}`}>
                          {service.active ? 'Operational' : 'Decommissioned'}
                        </div>
                      </td>
                      <td className="p-4 border-r border-black">
                        <div className="w-12 h-12 bg-brutalist-yellow border-[3px] border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          {service.icon}
                        </div>
                      </td>
                      <td className="p-4 border-r border-black uppercase tracking-tight font-black text-base">{service.name}</td>
                      <td className="p-4 border-r border-black">
                        <span className="bg-black text-white text-[9px] px-3 py-1 uppercase tracking-widest">{service.category}</span>
                      </td>
                      <td className="p-4 border-r border-black font-black text-lg">{service.price}</td>
                      <td className="p-4 border-r border-black">
                        <div className="flex flex-col gap-1">
                          <span className={`font-black text-base ${service.stock <= 5 ? 'text-red-600 animate-pulse' : ''}`}>
                            {service.stock <= 0 ? 'CRITICAL: EMPTY' : `${service.stock} UNITS`}
                          </span>
                          <div className="w-full h-2 bg-gray-200 border border-black overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${service.stock > 10 ? 'bg-brutalist-green' : service.stock > 0 ? 'bg-brutalist-yellow' : 'bg-red-600'}`}
                              style={{ width: `${Math.min((service.stock / 50) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(service.id, service.active ?? true)}
                            title={service.active ? 'Deactivate' : 'Activate'}
                            className={`p-2.5 border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${service.active ? 'bg-white' : 'bg-brutalist-green'}`}
                          >
                            {service.active ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => openKeyModal(service)}
                            title="Inventory Control"
                            className="p-2.5 bg-brutalist-yellow border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(service)}
                            title="Modify Parameters"
                            className="p-2.5 bg-brutalist-cyan border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <Edit size={18} />
                          </button>
                          {service.active && (
                            <button
                              onClick={() => handleDelete(service.id)}
                              title="Soft Deletion"
                              className="p-2.5 bg-brutalist-magenta text-white border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          {!service.active && (
                            <button
                              onClick={() => handleHardDelete(service.id)}
                              title="PERMANENT PURGE"
                              className="p-2.5 bg-red-600 text-white border-[2px] border-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <AlertTriangle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
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

                {!editingService && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase">Initial Digital Keys (One per line)</label>
                    <textarea
                      value={formData.initialKeys}
                      onChange={(e) => setFormData({ ...formData, initialKeys: e.target.value })}
                      className="brutalist-input w-full min-h-[80px] font-mono text-xs"
                      placeholder="KEY-123-ABC&#10;KEY-456-DEF&#10;..."
                    />
                    <p className="text-[10px] font-bold text-brutalist-magenta uppercase">Stock will be automatically set to the number of keys provided.</p>
                  </div>
                )}

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
