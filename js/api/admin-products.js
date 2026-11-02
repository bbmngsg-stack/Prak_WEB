// Admin-only product mutations and queries.
import { supabase } from '../supabase-client.js';

const PRODUCT_SELECT = `
  *,
  product_images(id, path_large, path_thumb, sort_order, is_cover),
  product_variants(id, color_name, color_hex, size_eu, stock)
`;

export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, category, name_id, price_idr, discount_percent, is_published, product_images(path_thumb, is_cover), product_variants(stock)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminProduct(id) {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProductDraft(fields) {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...fields, is_published: false })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateProduct(id, fields) {
  const { data, error } = await supabase.from('products').update(fields).eq('id', id).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('Produk tidak berubah. Periksa sesi dan izin akun admin.');
}

export async function saveProductVariants(productId, variants) {
  const { data: current, error: currentError } = await supabase
    .from('product_variants').select('id, product_id, color_name, color_hex, size_eu, stock').eq('product_id', productId);
  if (currentError) throw currentError;

  const { data: saved, error } = await supabase
    .from('product_variants')
    .upsert(variants.map(v => ({ ...v, product_id: productId })), {
      onConflict: 'product_id,color_name,size_eu'
    })
    .select('id');
  if (error) throw error;
  if (!saved || saved.length !== variants.length) throw new Error('Sebagian varian tidak tersimpan. Periksa izin akun admin lalu coba lagi.');

  const keepIds = new Set((saved || []).map(v => v.id));
  const removedIds = (current || []).filter(v => !keepIds.has(v.id)).map(v => v.id);
  if (removedIds.length) {
    const { data: deleted, error: deleteError } = await supabase.from('product_variants').delete().in('id', removedIds).select('id');
    if (deleteError || deleted?.length !== removedIds.length) {
      const currentIds = new Set((current || []).map(v => v.id));
      if (current?.length) await supabase.from('product_variants').upsert(current, { onConflict: 'id' });
      const newIds = (saved || []).filter(v => !currentIds.has(v.id)).map(v => v.id);
      if (newIds.length) await supabase.from('product_variants').delete().in('id', newIds);
      throw deleteError || new Error('Sebagian varian lama tidak dapat dihapus. Periksa izin akun admin.');
    }
  }
}

export async function saveProductImages(productId, images) {
  const { data: current, error: currentError } = await supabase
    .from('product_images').select('id, product_id, path_large, path_thumb, sort_order, is_cover').eq('product_id', productId);
  if (currentError) throw currentError;

  const rows = images.map((image, sort_order) => ({
    ...(image.id ? { id: image.id } : {}),
    product_id: productId,
    path_large: image.path_large,
    path_thumb: image.path_thumb,
    sort_order,
    is_cover: image.is_cover
  }));
  if (rows.length) {
    const { data: saved, error } = await supabase.from('product_images').upsert(rows, { onConflict: 'id' }).select('id, path_large, path_thumb, sort_order, is_cover');
    if (error) throw error;
    if (!saved || saved.length !== rows.length) throw new Error('Sebagian foto tidak tersimpan. Periksa izin akun admin lalu coba lagi.');
    images = saved || [];
  }

  const keepIds = new Set(images.filter(i => i.id).map(i => i.id));
  const removed = (current || []).filter(i => !keepIds.has(i.id));
  if (removed.length) {
    const { data: deleted, error } = await supabase.from('product_images').delete().in('id', removed.map(i => i.id)).select('id');
    if (error || deleted?.length !== removed.length) {
      const currentIds = new Set((current || []).map(i => i.id));
      if (current?.length) await supabase.from('product_images').upsert(current, { onConflict: 'id' });
      const newIds = images.filter(i => i.id && !currentIds.has(i.id)).map(i => i.id);
      if (newIds.length) await supabase.from('product_images').delete().in('id', newIds);
      throw error || new Error('Sebagian foto lama tidak dapat dihapus. Periksa izin akun admin.');
    }
  }
  return { removedUrls: removed.flatMap(i => [i.path_large, i.path_thumb]), savedImages: images };
}

export async function removeProductImages(urls) {
  const base = `${(await supabase.storage.from('product-images').getPublicUrl('')).data.publicUrl}`;
  const paths = [...new Set(urls.map(url => url.startsWith(base) ? decodeURIComponent(url.slice(base.length)) : null).filter(Boolean))];
  if (!paths.length) return;
  const { error } = await supabase.storage.from('product-images').remove(paths);
  if (error) throw error;
}

export async function deleteProduct(id) {
  const { data, error: readError } = await supabase
    .from('product_images').select('path_large, path_thumb').eq('product_id', id);
  if (readError) throw readError;

  const { data: deleted, error } = await supabase.from('products').delete().eq('id', id).select('id').single();
  if (error) throw error;
  if (!deleted) throw new Error('Produk tidak terhapus. Pastikan akun memiliki peran owner.');
  try {
    await removeProductImages((data || []).flatMap(i => [i.path_large, i.path_thumb]));
    return null;
  } catch (cleanupError) {
    console.warn('Produk terhapus, tetapi sebagian file foto gagal dibersihkan:', cleanupError);
    return 'Produk terhapus, tetapi sebagian file foto di Storage gagal dibersihkan.';
  }
}
