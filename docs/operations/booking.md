# Consultation booking

**Status**: Implemented locally; live account settings and end-to-end delivery remain unverified. See [connection and launch setup](functional-launch.md).

The qualified-path example can show Erik's supplied [Google Calendar appointment schedule](https://calendar.google.com/calendar/appointments/schedules/AcZssZ3yGOu537xocx0E6JCgrbNeC3bf_jSF8CuCn9fS41FLe8nhR9QZR_EH5suk7HGBTPbr1NZbxS_8?gv=true). The review page loads the embed only after a visitor asks to load it. The schedule is real: selecting a time may create an appointment. Do not make a test booking unless it is intended and separately authorized.

The qualification flow sends the project brief and photos when its intake URL is configured. Every lead currently needs Erik's review. After receipt, the homeowner can copy the project reference and open the Google schedule. The Worker polls the connected booking calendar every five minutes, associates events containing that reference with the delivered JobTread job, and handles reschedules and cancellations. The operator page supplies Google consent and recovery. Before real use, confirm the actual reference-question readback, schedule modes, availability, timezone, buffers, notices, reminders, cancellation/reschedule, and JobTread task permissions. Local tests do not establish live booking delivery.

Erik owns schedule availability and meeting mode. Matt/BIS owns site wiring and release evidence. No Google account configuration or booking test is included in the local demo work.
