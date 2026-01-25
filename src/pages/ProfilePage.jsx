import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../context/PremiumContext'
import { profileService } from '../services/supabase'
import { supabase } from '../services/supabase'
import { forumService } from '../services/forum'
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Edit2, 
  Save, 
  X,
  MessageSquare,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  Camera,
  Upload
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { isPremium, subscription } = usePremium()
  const navigate = useNavigate()

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    topicsCount: 0,
    postsCount: 0
  })

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    const { data, error } = await profileService.getProfile(user.id)
    if (!error && data) {
      setFullName(data.full_name || '')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
    }
    setLoading(false)
  }

  const loadStats = async () => {
    if (!user) return
    
    const forumStats = await forumService.getUserStats(user.id)
    setStats(forumStats)
  }

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) return

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 2MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`])
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const newAvatarUrl = urlData.publicUrl

      // Update profile
      const { error: updateError } = await profileService.updateProfile(user.id, {
        avatar_url: newAvatarUrl
      })

      if (updateError) throw updateError

      setAvatarUrl(newAvatarUrl)
      toast.success('Photo de profil mise Ã  jour!')
      
      // Force reload to show new image
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Le nom ne peut pas être vide')
      return
    }

    setSaving(true)
    const { error } = await profileService.updateProfile(user.id, {
      full_name: fullName,
      bio: bio
    })

    if (!error) {
      toast.success('Profil mis Ã  jour!')
      setIsEditing(false)
    } else {
      toast.error('Erreur lors de la mise Ã  jour')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast.success('Déconnecté avec succès')
      navigate('/login')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFullName(profile?.full_name || '')
    setBio(profile?.bio || '')
  }

  if (loading) {
    return (
      <div className='text-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green mx-auto'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#0a1f14] pb-24 px-4 pt-20'><div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-white'>Mon Profil</h1>
        <button
          onClick={handleSignOut}
          className='btn-secondary flex items-center gap-2'
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>

      {/* Profile Card */}
      <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg'>
        <div className='flex items-start gap-6'>
          {/* Avatar */}
          <div className='relative group flex-shrink-0'>
            {avatarUrl ? (
              <img
                src={`${avatarUrl}?t=${Date.now()}`}
                alt='Avatar'
                className='w-24 h-24 rounded-full object-cover border-4 border-senegal-yellow'
                key={avatarUrl}
              />
            ) : (
              <div className='w-24 h-24 rounded-full bg-gradient-to-br from-senegal-green to-green-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-senegal-yellow'>
                {(fullName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            
            {/* Upload button overlay */}
            <label className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
              <Camera size={24} className='text-white' />
              <input
                type='file'
                accept='image/*'
                onChange={handleAvatarUpload}
                disabled={uploading}
                className='hidden'
              />
            </label>

            {uploading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className='flex-1'>
            {isEditing ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>Nom complet</label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className='input-field'
                    placeholder='Votre nom complet'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className='input-field'
                    rows='3'
                    placeholder='Parlez-nous de vous...'
                  />
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className='btn-primary flex items-center gap-2'
                  >
                    {saving ? (
                      <>Enregistrement...</>
                    ) : (
                      <>
                        <Save size={18} />
                        Enregistrer
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className='btn-secondary flex items-center gap-2'
                  >
                    <X size={18} />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h2 className='text-2xl font-bold text-white'>{fullName || 'Utilisateur'}</h2>
                  {isPremium && (
                    <span className='flex items-center gap-1 bg-gradient-to-r from-senegal-yellow to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                      <Crown size={16} />
                      Premium
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-2 text-gray-300 mb-3'>
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>

                <div className='flex items-center gap-2 text-gray-300 mb-4'>
                  <Calendar size={16} />
                  <span>Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}</span>
                </div>

                {bio && (
                  <p className='text-gray-200 mb-4'>{bio}</p>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className='btn-secondary flex items-center gap-2'
                >
                  <Edit2 size={18} />
                  Modifier le profil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg'>
        <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
          <TrendingUp size={24} className='text-senegal-green' />
          Statistiques
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-blue-500/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-blue-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-300'>Sujets créés</p>
                <p className='text-3xl font-bold text-blue-300'>{stats.topicsCount}</p>
              </div>
              <MessageSquare size={32} className='text-blue-500' />
            </div>
          </div>

          <div className='bg-green-500/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-green-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-300'>Réponses postées</p>
                <p className='text-3xl font-bold text-green-300'>{stats.postsCount}</p>
              </div>
              <Award size={32} className='text-green-500' />
            </div>
          </div>

          <div className='bg-purple-500/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-purple-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-300'>Points</p>
                <p className='text-3xl font-bold text-purple-300'>
                  {stats.topicsCount * 10 + stats.postsCount * 5}
                </p>
              </div>
              <TrendingUp size={32} className='text-purple-500' />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Status */}
      <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg'>
        <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
          <Crown size={24} className='text-senegal-yellow' />
          Statut Premium
        </h3>

        {isPremium ? (
          <div className='bg-gradient-to-r from-senegal-green to-green-600 text-white p-6 rounded-lg'>
            <div className='flex items-center gap-3 mb-4'>
              <Crown size={32} />
              <div>
                <h4 className='text-2xl font-bold text-white'>Vous êtes Premium!</h4>
                <p className='text-green-100'>Profitez de toutes les fonctionnalités illimitées</p>
              </div>
            </div>

            {subscription?.expires_at ? (
              <p className='text-sm'>
                Expire le: {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
              </p>
            ) : (
              <p className='text-sm'>Abonnement Ã  vie ✨</p>
            )}
          </div>
        ) : (
          <div className='bg-white/10 backdrop-blur-sm p-6 rounded-lg'>
            <h4 className='text-xl font-semibold mb-2'>Compte Gratuit</h4>
            <p className='text-gray-300 mb-4'>
              Passez Ã  Premium pour débloquer toutes les fonctionnalités!
            </p>
            <ul className='space-y-2 mb-4'>
              <li className='flex items-center gap-2 text-gray-200'>
                <span className='text-senegal-green'>âœ“</span>
                Messages IA illimités
              </li>
              <li className='flex items-center gap-2 text-gray-200'>
                <span className='text-senegal-green'>âœ“</span>
                Analyse de photos et PDF
              </li>
              <li className='flex items-center gap-2 text-gray-200'>
                <span className='text-senegal-green'>âœ“</span>
                Accès complet aux bourses
              </li>
              <li className='flex items-center gap-2 text-gray-200'>
                <span className='text-senegal-green'>âœ“</span>
                Forum illimité
              </li>
            </ul>
            <button
              onClick={() => navigate('/premium')}
              className='btn-primary flex items-center gap-2'
            >
              <Crown size={20} />
              Passer Ã  Premium
            </button>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg'>
        <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
          <Settings size={24} className='text-gray-300' />
          Paramètres du compte
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg'>
            <div>
              <p className='font-semibold'>Notifications par email</p>
              <p className='text-sm text-gray-300'>Recevoir des emails pour les nouvelles bourses</p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' className='sr-only peer' />
              <div className='w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-senegal-green'></div>
            </label>
          </div>

          <div className='flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg'>
            <div>
              <p className='font-semibold'>Langue</p>
              <p className='text-sm text-gray-300'>Choisir la langue de l'interface</p>
            </div>
            <select className='input-field w-32'>
              <option value='fr'>Français</option>
              <option value='en'>English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='card border-2 border-red-200'>
        <h3 className='text-xl font-bold text-white mb-4 text-red-600'>Zone dangereuse</h3>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-semibold'>Supprimer le compte</p>
              <p className='text-sm text-gray-300'>Cette action est irréversible</p>
            </div>
            <button className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div></div>
  )
}