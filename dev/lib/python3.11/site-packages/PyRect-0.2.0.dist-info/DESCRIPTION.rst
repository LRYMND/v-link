======
PyRect
======
PyRect is a simple module with a Rect class for Pygame-like rectangular areas.

This module is like a stand-alone version of Pygame's Rect class. It is similar to the Rect module by Simon Wittber, but compatible with both Python 2 and 3.

Currently under development, though the basic features work.

Installation
============

    ``pip install pyrect``

Quickstart Guide
================

First, create a Rect object by providing the XY coordinates of its top-left corner, and then the width and height:

    >>> import pyrect
    >>> r = pyrect.Rect(0, 0, 10, 20)

There are several attributes that are automatically calculated (they have the same names as Pygame's Rect objects):

    >>> r.width, r.height, r.size
    (10, 20, (10, 20))
    >>> r. left
    0
    >>> r.right
    10
    >>> r.top
    0
    >>> r.bottom
    20
    >>> r.center
    (5, 10)
    >>> r.topleft
    (0, 0)
    >>> r.topright
    (10, 0)
    >>> r.midleft
    (0, 10)

Changing these attributes re-calculates the others. The top-left corner is anchored for any growing or shrinking that takes place.

    >>> r.topleft
    (0, 0)
    >>> r.left = 100
    >>> r.topleft
    (100, 0)
    >>> r.topright
    (110, 0)
    >>> r.width = 30
    >>> r.topright
    (130, 0)

Rect objects are locked to integers, unless you set `enableFloat` to `True`:

    >>> r = pyrect.Rect(0, 0, 10, 20)
    >>> r.width = 10.5
    >>> r.width
    10
    >>> r.enableFloat = True
    >>> r.width = 10.5
    >>> r.width
    10.5
    >>> r2 = pyrect.Rect(0, 0, 10.5, 20.5, enableFloat=True)
    >>> r2.size
    (10.5, 20.5)

Rect Attributes
===============

Rect objects have several attributes that can be read or modified. They are identical to Pygame's Rect objects:

    ``x, y``

    ``top, left, bottom, right``

    ``topleft, bottomleft, topright, bottomright``

    ``midtop, midleft, midbottom, midright``

    ``center, centerx, centery``

    ``size, width, height``

    ``w, h``

There are a couple other attributes as well:

    ``box (a tuple (left, top, width, height))``

    ``area (read-only)``

    ``perimeter (read-only)``



