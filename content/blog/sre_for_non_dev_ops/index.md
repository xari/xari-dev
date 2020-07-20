---
title: Applying SRE
date: 2020-05-05
description: Applying SRE to learner support operations at an online school
---

At EXTS, we're in the business of supporting our learners across several courses and multi-course "programs".
Each learner pays us several hundred Swiss Francs per month in exchange for course content, up to a half hour of individualized video-based face-time with a couse developer, and prompt responses of any question they post on the learner platform.



Scaleability at EXTS is constrained by the course-developer:learner ratio.
The more that we can positively skew the course-developer:learner ratio on the learner-side, the greater our capacity to up-skill the workforce will be, and the higher our profit margin will be (provided that the cost to attract new learners remains constant).

On the other end of the scale is the need to keep our courses and our graduates worthy of the EPFL name.
This means keeping track of the libraries and packages that we teach, and updating them whenever a new release implements something relevant to our curriculum, and it also means identifying areas of course content that need to be fixed (typos in code examples, broken quizzes, etc).
Each learner is entitled to a half hour of individual course developer time per week, and we also guarantee a 24 hour response time for questions posted on the platform, but we try our best to answer questions within the same 4 hour shift in which we receive them.

So; our responsibility as course developers is split between direct learner support (1-1 face-time & responding to posted questions), and indirect learner support (content improvement).
To answer the question of how do we scale-up our operations while keeping our work enjoyable and sustainable; I'd like to propose a practice that I've dubbed **"Course Operations Engineering"**.

Course operations engineering is the application of Google's Site Reliability Engineering (SRE) to our work at the Extension School.
SRE is Google's approach to doing Dev Ops —the practice of deploying and maintaining software.
I think there are a lot of similarities between what they do and what we do.

| Google        | EXTS          |
| ------------- |:-------------:|
| Deployment and maintenance of software | Production and maintenance of courses and programs |
| SREs are interdisciplinary software engineers/systems engineers/sys admins | Course developers are interdisciplinary data scientists/software engineers/educators |
| Time sensitive work: fixing crashes within acceptible down-time budgets; scheduled deployment and maintenance of infrastructure | Direct learner support: answering learner questions within 24 hours; grading projects within two week window; updating content within a reasonable window of new package releases, etc. |

SREs work "on-call" shifts, where they are available to respond at-once to any system failure that gets called-in.
Due to the potential for on-call work to be draining, SREs strictly limit their on-call work to no more than 50% of their time.
The rest of this time is spent on engineering new ways to automate the manual parts of their work, which both increases overall resiliancy, and satisfies the SREs' need to keep their skills sharp through creative work.

Like SREs, course developers have time sensitive work, and have shifts where we must be available to meet 1-1 with our learners.
Also like SREs, we too regularly work on repetitive tasks that can benefit from creative engineering.

For example; teaching how GitHub integrates with R-Studio for the 50th time is hardly satisfying, and it takes valuable 1-1 time away from engaging the learner on more challenging subjects.
Recording a screencast to explain how this works might take two hours, but that effort will pay for itself after the fourth 1-1 where we don't have to explain that topic to a learner.

Setting a strict limit on direct learner support to a daily four hour shift will free-up course developers to spend the rest of their time on creative work that supports the quality & scaleability of our courses.

* Recording Screencasts for difficult concepts
* Developing new learner analytics
* Expanding quiz coverage
* Creating new course projects
* Automating the assignment of course projects using Git Hooks

The examples above are just a small sample of the opportunities that we have to boost scaleability.
Over time, these improvements will increase the quality of direct learner support, and they will also increase the predictability of our graduates as qualified data scientists and web developers.

Being able to define the role of a course developer in this strict 50%/50% way will also help immensely with recruitment, because it will ensure that we're soliciting applications from the well-rounded candidates who will fit in well with the rest of us who have pioneered our model of supported online learning.
It will also ensure that we keep our own skills sharp; keeping us relevant and cutting-edge enough to be worthy of the role of teaching others.

In addition to implementing a system like the one proposed here, we also need to determine metrics for success and scaleability for our courses.
In order to ensure that no course team is over-worked by too much direct learner support per course developer, course developers from other teams should be ready to temporarily boost on other courses to bring a balance to the direct learner support load.
In other words; if learner support for ADSCV is too demanding, course developers from other teams should be free to temporarily help out with improving the course until the direct learner support need is balanced out.
This has the added benefit of increasing overall knowledge and experience among our courses.
