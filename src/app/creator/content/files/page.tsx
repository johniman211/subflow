'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Download,
  Plus,
  Search,
  Edit,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
  FileText,
  Music,
  Archive,
  File,
} from 'lucide-react';

interface FileItem {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size_bytes: number;
  file_type: string;
  status: 'draft' | 'published';
  view_count: number;
  download_count: number;
  is_free: boolean;
  created_at: string;
}

const fileTypeIcons: { [key: string]: any } = {
  'application/pdf': FileText,
  'audio/mpeg': Music,
  'audio/mp3': Music,
  'application/zip': Archive,
};

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FilesPage() {
  const { theme } = useTheme();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: creator } = await supabase
      .from('creators')
      .select('id, username')
      .eq('user_id', user.id)
      .single();

    if (!creator) {
      setLoading(false);
      return;
    }

    setCreatorUsername(creator.username);

    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('content_type', 'file')
      .order('created_at', { ascending: false });

    if (data) {
      setFiles(data);
    }

    setLoading(false);
  };

  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyShareLink = (file: FileItem) => {
    navigator.clipboard.writeText(`https://payssd.com/c/${creatorUsername}/download/${file.id}`);
    alert('Share link copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Files
          </h1>
          <p className={cn("mt-1", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {files.length} files · {files.reduce((sum, f) => sum + f.download_count, 0)} total downloads
          </p>
        </div>
        <Link
          href="/creator/content/files/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Upload File
        </Link>
      </div>

      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl border",
        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex-1 relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme === 'dark' ? 'text-dark-400' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border",
              theme === 'dark' 
                ? 'bg-dark-900 border-dark-600 text-white placeholder:text-dark-400' 
                : 'bg-gray-50 border-gray-300'
            )}
          />
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className={cn(
          "text-center py-16 rounded-xl border",
          theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        )}>
          <Download className={cn("h-12 w-12 mx-auto mb-4", theme === 'dark' ? 'text-dark-500' : 'text-gray-400')} />
          <h3 className={cn("text-lg font-medium mb-2", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            No files yet
          </h3>
          <p className={cn("mb-6", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            Upload PDFs, audio, or zip files
          </p>
          <Link
            href="/creator/content/files/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Upload File
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file) => {
            const FileIcon = fileTypeIcons[file.file_type] || File;
            
            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  theme === 'dark' 
                    ? 'bg-dark-800 border-dark-700 hover:border-dark-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-green-400 bg-green-500/20">
                  <FileIcon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-medium truncate", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {file.title}
                    </h3>
                    {file.status === 'published' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
                    {file.file_name} · {formatFileSize(file.file_size_bytes)}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {file.download_count}
                    </p>
                    <p className={cn("text-xs", theme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>Downloads</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyShareLink(file)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/creator/content/files/${file.id}/edit`}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      theme === 'dark' ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                    )}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
