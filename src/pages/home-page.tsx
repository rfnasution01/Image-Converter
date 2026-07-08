import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Line } from '@/components/charts/chart';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { CheckboxInput } from '@/components/form/checkbox-input';
import { DateInput } from '@/components/form/date-input';
import { RadioInput } from '@/components/form/radio-input';
import { SelectInput, type SelectOption } from '@/components/form/select-input';
import { TextAreaInput } from '@/components/form/text-area';
import { TextInput } from '@/components/form/text-input';
import { DataTable, type DataTableColumnDef } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { sanitizeHtml } from '@/lib/sanitize';

const schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  gender: z.string().min(1, 'Pilih gender'),
  accept: z.boolean().refine(Boolean, 'Wajib disetujui'),
  birthDate: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.object({ label: z.string(), value: z.string() }).nullable(),
  description: z.string().optional(),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type UserRow = { id: number; name: string; role: string };

const columns: DataTableColumnDef<UserRow>[] = [
  { accessorKey: 'name', header: 'Nama', meta: { label: 'Nama' } },
  { accessorKey: 'role', header: 'Role', meta: { label: 'Role' } },
];

const categoryOptions: SelectOption[] = [
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
];

export function HomePage() {
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);
  const { data: healthText = 'API belum dipanggil' } = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get('/health')).data as string,
    enabled: false,
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', gender: '', accept: false, birthDate: '', category: null, description: '', content: '' },
  });

  const onSubmit = (values: FormValues) => {
    console.log({ ...values, content: sanitizeHtml(values.content ?? '') });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <FontAwesomeIcon icon={faRocket} className="text-primary" /> Vite + React TS Boilerplate
        </h1>
        <p className="mt-2 text-muted-foreground">Alias @ aktif, theme light/dark tersedia, API via TanStack Query + Axios. {healthText}</p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-xl border bg-card p-6 md:grid-cols-2">
        <TextInput label="Nama" prefix="@" suffix="ID" error={errors.name?.message} {...register('name')} />
        <DateInput label="Tanggal lahir" suffix={formatDate(new Date())} error={errors.birthDate?.message} {...register('birthDate')} />
        <Controller name="gender" control={control} render={({ field }) => (
          <RadioInput label="Gender" options={[{ label: 'Pria', value: 'male' }, { label: 'Wanita', value: 'female' }]} error={errors.gender?.message} {...field} />
        )} />
        <Controller name="category" control={control} render={({ field }) => (
          <SelectInput label="Kategori" prefix="#" suffix="opsi" options={categoryOptions} error={errors.category?.message} {...field} />
        )} />
        <TextAreaInput label="Deskripsi" wrapperClassName="md:col-span-2" {...register('description')} />
        <Controller name="content" control={control} render={({ field }) => (
          <div className="space-y-2 md:col-span-2"><p className="text-sm font-medium">Text editor</p><TiptapEditor value={field.value} onChange={field.onChange} /></div>
        )} />
        <Controller name="accept" control={control} render={({ field }) => (
          <CheckboxInput label="Saya setuju" error={errors.accept?.message} checked={field.value} onCheckedChange={field.onChange} />
        )} />
        <div className="md:col-span-2"><Button type="submit">Submit</Button></div>
      </form>

      <section className="grid gap-6 md:grid-cols-2">
        <Line data={{ labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Demo', data: [12, 19, 8], borderColor: '#3b82f6' }] }} />
        <DataTable
          data={[{ id: 1, name: 'Admin', role: 'Owner' }]}
          columns={columns}
          pagination={{ page: tablePage, limit: tableLimit, totalItems: 1 }}
          showNumberColumn
          onPageChange={setTablePage}
          onLimitChange={(limit) => {
            setTableLimit(limit);
            setTablePage(1);
          }}
        />
      </section>
    </motion.div>
  );
}
