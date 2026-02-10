import type { Account } from '@/types/account'

export const mockAccounts: Account[] = [
  {
    id: '1',
    labels: [{ text: 'XXX' }],
    type: 'local',
    login: 'username1',
    password: 'password1',
  },
  {
    id: '2',
    labels: [{ text: 'XXX' }, { text: 'YYYYYYYYYY' }, { text: 'IIIIIIII' }, { text: 'MMMMMMMMM' }],
    type: 'local',
    login: 'username2',
    password: 'password2',
  },
  {
    id: '3',
    labels: [{ text: 'XXX' }],
    type: 'local',
    login: 'username3',
    password: 'password3',
  },
  {
    id: '4',
    labels: [],
    type: 'ldap',
    login: 'username4',
    password: null,
  },
  {
    id: '5',
    labels: [],
    type: 'ldap',
    login: 'username5',
    password: null,
  },
]
