function ClickableContext(spec) {
  const { entity } = spec

  let target = null
  let selection = null

  const mousePoint = Vector2()

  const hits = []
  const collectHitArgs = [mousePoint, hits]

  function processEvent(eventData, eventName) {
    mousePoint.set(eventData.offsetX, eventData.offsetY)

    // Collect all hits at mousePoint
    hits.length = 0
    entity.sendEvent('clickable.collectHit', collectHitArgs)

    // Sort hits by layer
    hits.sort(compareHits)

    // New target is the  top-level hit
    let newTarget = _.last(hits)

    if (newTarget != target) {
      // Exit old target, enter new target
      if (target) target.mouseExit(mousePoint)
      if (newTarget) newTarget.mouseEnter(mousePoint)

      // New target replaces the current target
      target = newTarget
    }

    if (eventName == 'mouseDown') {
      let newSelection = hits
        .reverse()
        .find((h) => h.enabled && h.entity.selectable)

      if (newSelection != selection) {
        selection?.deselect()
        newSelection?.select(() => {
          selection = null
        })
        selection = newSelection
      }
    }

    // Ping every clickable in this tree
    entity.sendEvent('clickable.' + eventName, [mousePoint])
  }

  function deselect(entity) {
    selection = null
    entity.deselect()
  }

  function compareHits(a, b) {
    return a.drawOrder - b.drawOrder
  }

  function keydown(key) {
    alert('keydown')
    if (key == 'Backspace' || key == 'Delete') {
      // TODO: Maybe tag entities with general type for polymorphism?
      if (selection && selection.name.includes('Goal')) {
        editor.deselect()
        world.level.sendEvent('goalDeleted', [selection])
        selection.destroy()
      }
    }
  }

  return {
    deselect,
    processEvent,
    keydown,
  }
}
