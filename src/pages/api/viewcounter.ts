import { type APIRoute } from 'astro'
import prisma from '@/lib/prisma'

export const prerender = false;

async function getPageViews(slug: string) {
    try {
        return await prisma.views.upsert({
            where: { slug },
            create: { slug, count: 1 },
            update: { count: { increment: 1 } },
            select: { slug: true, count: true },
        });
    } catch (error) {
        console.error(error);
        return { slug, count: 1 };
    }
}

export const GET: APIRoute = async ({ url }) => {
    try {
        const slug = url.searchParams.get('slug');
        if (!slug) {
            return new Response(JSON.stringify({ error: 'Missing slug' }), { 
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0'
                }
            });
        }
        
        const record = await prisma.views.findUnique({
            where: { slug },
            select: { slug: true, count: true }
        });
        
        return new Response(JSON.stringify(record ?? { slug, count: 0 }), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ slug: '', count: 0 }), { 
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { slug } = body;
        
        if (!slug) {
            return new Response(JSON.stringify({ error: 'Missing slug' }), { 
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0'
                }
            });
        }
        
        const pageViews = await getPageViews(slug);
        
        return new Response(JSON.stringify(pageViews), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: 'Invalid request' }), { 
            status: 400,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    }
}