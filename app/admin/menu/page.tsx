'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import clsx from 'clsx';
import { getSupabase, menuItemToRow, rowToMenuItem, MenuItemRow } from '@/lib/supabase';
import { MenuItem, MENU_ITEMS, CATEGORIES } from '@/lib/menu-data';

// ─── Form ────────────────────────────────────────────────────────────────────
type MenuForm = Omit<MenuItem, 'id' | 'isAvailable' | 'tags'> & { tagsRaw: string };

// ─── Tag Badge ────────────────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: string }) {
  const styles: Record<string, string> = {
    veg:        'bg-accent-green/20 text-accent-green',
    bestseller: 'bg-primary/20 text-primary',
    spicy:      'bg-accent-red/20 text-accent-red',
  };
  return (
    <span className={clsx('rounded-lg px-2 py-0.5 text-[10px] font-bold', styles[tag] ?? 'bg-white/10 text-white/60')}>
      {tag}
    </span>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={on ? 'Mark Unavailable' : 'Mark Available'}
      className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', on ? 'bg-accent-green' : 'bg-white/20')}
    >
      <span className={clsx('h-4 w-4 transform rounded-full bg-white shadow transition-transform', on ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MenuManagerPage() {
  const [items, setItems]               = useState<MenuItem[]>([]);
  const [filterCat, setFilterCat]       = useState('All');
  const [search, setSearch]             = useState('');
  const [editItem, setEditItem]         = useState<MenuItem | null>(null);
  const [isOpen, setIsOpen]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [uploadPct, setUploadPct]       = useState(0);
  const [uploading, setUploading]       = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<MenuForm>();
  const imageUrlWatch = watch('imageUrl');

  // ── Load menu from Supabase (fallback to static) ──────────────────────────
  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) {
        setItems(MENU_ITEMS);
        return;
      }
      try {
        const { data } = await sb.from('menu_items').select('*');
        setItems(data?.length ? (data as MenuItemRow[]).map(rowToMenuItem) : MENU_ITEMS);
      } catch {
        setItems(MENU_ITEMS);
      }
    })();
  }, []);

  // ── Open dialog ───────────────────────────────────────────────────────────
  const openDialog = (item?: MenuItem) => {
    setEditItem(item ?? null);
    reset(item
      ? { name: item.name, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl, tagsRaw: (item.tags ?? []).join(', ') }
      : { name: '', description: '', category: CATEGORIES[0], imageUrl: '', tagsRaw: '' },
    );
    setIsOpen(true);
  };

  // ── Image upload to Supabase Storage ──────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    const sb = getSupabase();
    if (!sb) {
      toast.error('Supabase storage not configured');
      return;
    }

    setUploading(true);
    const path = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // Simulate progress (Supabase JS v2 doesn't have upload progress events)
    const progressInterval = setInterval(() => {
      setUploadPct((p) => Math.min(p + 15, 85));
    }, 200);

    const { data, error } = await sb.storage.from('menu-images').upload(path, file, { upsert: true });
    clearInterval(progressInterval);

    if (error || !data) {
      toast.error('Upload failed');
      setUploading(false);
      setUploadPct(0);
      return;
    }

    const { data: { publicUrl } } = sb.storage.from('menu-images').getPublicUrl(data.path);
    setValue('imageUrl', publicUrl, { shouldValidate: true });
    setUploadPct(100);
    setTimeout(() => { setUploading(false); setUploadPct(0); }, 400);
    toast.success('Image uploaded!');
  };

  // ── Save (upsert) ─────────────────────────────────────────────────────────
  const onSubmit = async (data: MenuForm) => {
    const id = editItem?.id ?? `item_${Date.now()}`;
    const newItem: MenuItem = {
      id, isAvailable: editItem?.isAvailable ?? true,
      name: data.name, description: data.description,
      price: Number(data.price), category: data.category,
      imageUrl: data.imageUrl,
      tags: data.tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const sb = getSupabase();
    if (sb) {
      await toast.promise(
        (async () => { await sb.from('menu_items').upsert(menuItemToRow(newItem)); })(),
        { loading: 'Saving…', success: 'Saved!', error: 'Failed to save to database.' },
      );
    } else {
      toast.success('Saved locally!');
    }
    setItems((prev) => prev.some((i) => i.id === id) ? prev.map((i) => (i.id === id ? newItem : i)) : [...prev, newItem]);
    setIsOpen(false);
  };

  // ── Toggle availability ───────────────────────────────────────────────────
  const toggleAvailability = async (item: MenuItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('menu_items').update({ is_available: updated.isAvailable }).eq('id', item.id);
      } catch { /* ignore */ }
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    toast.success(`${item.name} marked ${updated.isAvailable ? 'available ✅' : 'unavailable 🚫'}`);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const sb = getSupabase();
    if (sb) {
      await toast.promise(
        (async () => { await sb.from('menu_items').delete().eq('id', deleteTarget.id); })(),
        { loading: 'Deleting…', success: 'Deleted', error: 'Failed.' },
      );
    } else {
      toast.success('Deleted locally');
    }
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const displayed = items
    .filter((i) => filterCat === 'All' || i.category === filterCat)
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#221C19', color: '#fff', border: '1px solid rgba(255,188,13,0.3)' } }} />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-georgia text-xl font-bold text-white">Menu Manager</h2>
            <p className="text-xs text-white/40">{items.length} items · {items.filter((i) => i.isAvailable).length} available</p>
          </div>
          <button
            onClick={() => openDialog()}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-georgia text-sm font-black text-black shadow-premium hover:bg-primary/90 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items…"
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary transition-colors"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', ...CATEGORIES].map((c) => (
              <button
                key={c} onClick={() => setFilterCat(c)}
                className={clsx('whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-colors', filterCat === c ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid — 1 col mobile, 2 sm, 3 lg, 4 xl */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayed.map((item) => (
            <div
              key={item.id}
              className={clsx(
                'flex flex-col rounded-2xl border bg-[#221C19]/90 p-4 shadow-premium transition-opacity',
                item.isAvailable ? 'border-white/10' : 'border-white/5 opacity-55',
              )}
            >
              {/* Image */}
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-white/5">
                <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" className="object-cover" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55">
                    <span className="rounded-lg bg-accent-red/80 px-3 py-1 text-xs font-bold text-white">UNAVAILABLE</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-3 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-georgia text-sm font-bold text-white leading-snug">{item.name}</p>
                  <p className="whitespace-nowrap font-georgia text-sm font-black text-primary">₹{item.price}</p>
                </div>
                <p className="text-[11px] text-white/45 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-white/45">{item.category}</span>
                  {item.tags?.map((t) => <TagBadge key={t} tag={t} />)}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
                <Toggle on={item.isAvailable} onToggle={() => toggleAvailability(item)} />
                <div className="flex gap-2">
                  <button onClick={() => openDialog(item)} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors">✏️ Edit</button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-xl bg-accent-red/15 px-3 py-1.5 text-xs font-bold text-accent-red hover:bg-accent-red/25 transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayed.length === 0 && (
          <p className="py-20 text-center text-white/25">No items found.</p>
        )}
      </div>

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#1a1410] p-6 shadow-2xl overflow-y-auto max-h-[92dvh]">
            <Dialog.Title className="font-georgia text-xl font-black text-white mb-5">
              {editItem ? '✏️ Edit Item' : '➕ Add New Item'}
            </Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-bold text-white/55">Item Name *</label>
                <input {...register('name', { required: 'Required' })}
                  className="input-field" placeholder="e.g. Classic Margherita" />
                {errors.name && <p className="mt-1 text-xs text-accent-red">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-bold text-white/55">Description *</label>
                <textarea {...register('description', { required: 'Required' })} rows={3}
                  className="input-field resize-none" placeholder="Ingredients, flavour profile…" />
                {errors.description && <p className="mt-1 text-xs text-accent-red">{errors.description.message}</p>}
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-white/55">Price (₹) *</label>
                  <input type="number" min={1} {...register('price', { required: 'Required', valueAsNumber: true, min: 1 })}
                    className="input-field" placeholder="299" />
                  {errors.price && <p className="mt-1 text-xs text-accent-red">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-white/55">Category *</label>
                  <select {...register('category')} className="input-field bg-[#221C19]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs font-bold text-white/55">Tags (comma-separated)</label>
                <input {...register('tagsRaw')} className="input-field" placeholder="veg, bestseller, spicy" />
              </div>

              {/* Image */}
              <div>
                <label className="mb-1 block text-xs font-bold text-white/55">Image</label>
                <div className="space-y-2">
                  <input {...register('imageUrl', { required: 'Image required' })}
                    className="input-field" placeholder="Paste image URL  OR  upload below" />

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs font-bold text-white/50 hover:border-primary/50 hover:text-white transition-colors">
                    📁 Upload from device
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  </label>

                  {uploading && (
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadPct}%` }} />
                    </div>
                  )}

                  {imageUrlWatch && !uploading && (
                    <div className="relative h-28 w-full overflow-hidden rounded-xl bg-white/5">
                      <Image src={imageUrlWatch} alt="preview" fill sizes="400px" className="object-cover" />
                    </div>
                  )}
                  {errors.imageUrl && <p className="text-xs text-accent-red">{errors.imageUrl.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || uploading}
                  className="flex-1 rounded-2xl bg-primary py-3 font-georgia text-sm font-black text-black shadow-premium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {isSubmitting ? 'Saving…' : editItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-3xl border border-accent-red/30 bg-[#1a1410] p-6 shadow-2xl text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <Dialog.Title className="font-georgia text-lg font-black text-white">Delete Item?</Dialog.Title>
            <p className="mt-2 text-sm text-white/55">
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed from the menu.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 rounded-2xl bg-accent-red py-3 font-georgia text-sm font-black text-white hover:bg-accent-red/90 transition-colors">
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
