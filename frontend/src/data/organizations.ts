
/**
 * The organizations shown on the map. Their events are loaded from Stuk using `stuk_id`.
 * Logos are the organizations' Facebook profile pictures, resized to 128x128.
 */

import { Organization } from '@/types/events';

export const ORGANIZATIONS: Organization[] = [
  { id: 1, name: 'Blekingska Nationen', address: 'Ole Römers väg 14D, 223 63 Lund', latitude: 55.7127939, longitude: 13.2133118, stuk_id: 2635, logo: '/images/logos/blekingska.webp' },
  { id: 2, name: 'Göteborgs Nation', address: 'Östra Mårtensgatan 15, 223 61 Lund', latitude: 55.7015051, longitude: 13.1998779, stuk_id: 2653, logo: '/images/logos/goteborgs.webp' },
  { id: 3, name: 'Hallands Nation', address: 'Thomanders väg 3, Lund', latitude: 55.70557, longitude: 13.2111, stuk_id: 2644, logo: '/images/logos/hallands.webp' },
  { id: 4, name: 'Helsingkrona Nation', address: 'Tornavägen 3C, Lund', latitude: 55.70974, longitude: 13.20792, stuk_id: 2662, logo: '/images/logos/helsingkrona.webp' },
  { id: 5, name: 'Kalmar Nation', address: 'Biskopsgatan 12, Lund', latitude: 55.70648, longitude: 13.19836, stuk_id: 2672, logo: '/images/logos/kalmar.webp' },
  { id: 6, name: 'Kristianstads Nation', address: 'Tornavägen 7, Lund', latitude: 55.70902, longitude: 13.20751, stuk_id: 2680, logo: '/images/logos/kristianstads.webp' },
  { id: 7, name: 'Lunds Nation', address: 'Agardhsgatan 1, Lund', latitude: 55.70355, longitude: 13.19982, stuk_id: 2689, logo: '/images/logos/lunds.webp' },
  { id: 8, name: 'Malmö Nation', address: 'Östra Vallgatan 51, Lund', latitude: 55.70445, longitude: 13.20114, stuk_id: 2698, logo: '/images/logos/malmo.webp' },
  { id: 9, name: 'Smålands Nation', address: 'Kastanjegatan 7, Lund', latitude: 55.697862943711, longitude: 13.198463916779, stuk_id: 2754, logo: '/images/logos/smalands.webp' },
  { id: 10, name: 'Studentlund', address: 'Sandgatan 2, Lund', latitude: 55.708, longitude: 13.2109, stuk_id: 2513, logo: '/images/logos/studentlund.webp' },
  { id: 11, name: 'Sydskånska Nationen', address: 'Tornavägen 5, Lund', latitude: 55.70943, longitude: 13.20703, stuk_id: 2708, logo: '/images/logos/sydskanska.webp' },
  { id: 12, name: 'Västgöta Nation', address: 'Tornavägen 17-19, Lund', latitude: 55.70529, longitude: 13.21047, stuk_id: 2710, logo: '/images/logos/vastgota.webp' },
  { id: 13, name: 'Wermlands Nation', address: 'Stora Tvärgatan 13, Lund', latitude: 55.69945, longitude: 13.19371, stuk_id: 2709, logo: '/images/logos/wermlands.webp' },
  { id: 14, name: 'Östgöta Nation', address: 'Adelgatan 4, Lund', latitude: 55.70451, longitude: 13.19814, stuk_id: 2711, logo: '/images/logos/ostgota.webp' },
];
