import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, MoreHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { CheckboxInput } from '@/components/form/checkbox-input';
import { FileInput } from '@/components/form/file-input';
import { RadioInput } from '@/components/form/radio-input';
import { SelectInput, type SelectOption } from '@/components/form/select-input';
import { TextAreaInput } from '@/components/form/text-area';
import { TextInput } from '@/components/form/text-input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingDots, LoadingState } from '@/shared/components/loading-state';

const formSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  gender: z.string().min(1, 'Pilih salah satu'),
  accept: z.boolean().refine(Boolean, 'Wajib disetujui'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  category: z.object({ label: z.string(), value: z.string() }).nullable().refine(Boolean, 'Kategori wajib dipilih'),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions: SelectOption[] = [
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Design', value: 'design' },
];

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'next', label: 'Next.js' },
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card id={title.toLowerCase().replaceAll(' ', '-')}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ComboboxDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const selected = frameworks.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-56 justify-between">
          {selected?.label ?? 'Pilih framework'}
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Cari framework..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((item) => (
                <CommandItem key={item.value} value={item.value} onSelect={(current) => { setValue(current === value ? '' : current); setOpen(false); }}>
                  <Check className={cn('size-4', value === item.value ? 'opacity-100' : 'opacity-0')} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ComponentsShowcasePage() {
  const [toastOpen, setToastOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', gender: '', accept: false, description: '', category: null, content: '' },
  });

  return (
    <ToastProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shadcn UI Showcase</h1>
          <p className="mt-2 text-muted-foreground">Halaman default untuk melihat komponen, variasi, dan reusable component project.</p>
        </div>

        <Section title="Button" description="Variant dasar untuk action.">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="icon" aria-label="Contoh tombol ikon"><Sparkles className="size-4" /></Button>
          </div>
        </Section>

        <Section title="Card">
          <Card className="max-w-md">
            <CardHeader><CardTitle>Reusable Card</CardTitle><CardDescription>Container konten standar.</CardDescription></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Gunakan untuk grouping form, statistik, table, atau informasi.</CardContent>
          </Card>
        </Section>

        <Section title="Alert Dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Buka alert dialog</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini hanya contoh dialog konfirmasi.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction>Lanjutkan</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Menu <MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplikat</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Combobox dan Command">
          <div className="grid gap-4 md:grid-cols-2">
            <ComboboxDemo />
            <Command className="rounded-lg border">
              <CommandInput placeholder="Cari command..." />
              <CommandList><CommandEmpty>Tidak ada hasil.</CommandEmpty><CommandGroup heading="Menu"><CommandItem>Dashboard</CommandItem><CommandItem>Settings</CommandItem><CommandItem>Profile</CommandItem></CommandGroup></CommandList>
            </Command>
          </div>
        </Section>

        <Section title="Input dan Form" description="Menggunakan react-hook-form + @hookform/resolvers + zod.">
          <form onSubmit={form.handleSubmit((values) => console.log(values))} className="grid gap-4 md:grid-cols-2">
            <TextInput label="Nama" prefix="@" suffix="ID" error={form.formState.errors.name?.message} {...form.register('name')} />
            <TextInput label="Email" type="email" prefix="✉" error={form.formState.errors.email?.message} {...form.register('email')} />
            <Input placeholder="Input shadcn dasar" />
            <Controller name="gender" control={form.control} render={({ field }) => <RadioInput label="Radio" options={[{ label: 'Pria', value: 'male' }, { label: 'Wanita', value: 'female' }]} error={form.formState.errors.gender?.message} {...field} />} />
            <Controller name="accept" control={form.control} render={({ field }) => <CheckboxInput label="Checkbox persetujuan" checked={field.value} onCheckedChange={field.onChange} error={form.formState.errors.accept?.message} />} />
            <Controller name="category" control={form.control} render={({ field }) => <SelectInput label="React Select" prefix="#" suffix="opsi" options={categoryOptions} error={form.formState.errors.category?.message} {...field} />} />
            <TextAreaInput label="Textarea" wrapperClassName="md:col-span-2" error={form.formState.errors.description?.message} {...form.register('description')} />
            <FileInput label="File" wrapperClassName="md:col-span-2" hint="Contoh input file reusable." />
            <Controller name="content" control={form.control} render={({ field }) => <div className="space-y-2 md:col-span-2"><p className="text-sm font-medium">Text editor</p><TiptapEditor value={field.value} onChange={field.onChange} /></div>} />
            <Button type="submit">Submit form</Button>
          </form>
        </Section>

        <Section title="Popover dan Select">
          <div className="flex flex-wrap gap-3">
            <Popover><PopoverTrigger asChild><Button variant="outline">Buka popover</Button></PopoverTrigger><PopoverContent><p className="text-sm text-muted-foreground">Konten popover untuk info singkat atau form kecil.</p></PopoverContent></Popover>
            <Select><SelectTrigger className="w-48"><SelectValue placeholder="Pilih status" /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select>
          </div>
        </Section>

        <Section title="Toast dan Tooltip">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setToastOpen(true)}>Tampilkan toast</Button>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline">Hover saya</Button></TooltipTrigger><TooltipContent>Tooltip informatif</TooltipContent></Tooltip></TooltipProvider>
          </div>
          <Toast open={toastOpen} onOpenChange={setToastOpen}><div className="grid gap-1"><ToastTitle>Berhasil</ToastTitle><ToastDescription>Toast berhasil ditampilkan.</ToastDescription></div><ToastClose /></Toast>
          <ToastViewport />
        </Section>

        <Section title="Komponen penting">
          <div className="grid gap-4 md:grid-cols-2">
            <LoadingState />
            <div className="rounded-xl border bg-card p-6">Loading dots: <LoadingDots /></div>
            <EmptyState title="Belum ada data" description="Komponen empty state untuk table, list, dan halaman kosong." className="md:col-span-2" />
          </div>
        </Section>
      </div>
    </ToastProvider>
  );
}
