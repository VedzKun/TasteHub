import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { CalendarEvent } from '@/generated/prisma/client';

// GET all calendar events for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.calendarEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(
      events.map((e: CalendarEvent) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/calendar-events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description || null,
        date: body.date,
        time: body.time || null,
        type: body.type || 'reminder',
        color: body.color || null,
      },
    });

    return NextResponse.json(
      {
        ...event,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/calendar-events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// DELETE a calendar event
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('DELETE /api/calendar-events error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 400 });
  }
}
